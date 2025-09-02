import e, { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { dbPool } from '../connections/pg-connection';
import bcrypt from 'bcrypt';
import { CustomRequest, generateJwt } from '../middlewares/auth.middleware';
import jwt from 'jsonwebtoken';
import { redisClient } from '../connections/redis-connection';
import { otpFormat } from '../utils/mail/OTPFormat';
import { sendMail } from '../utils/mail/sendMail';
import uploadOnCloud from '../utils/uploadOnCloud';
import { Client } from 'pg';

interface Register {
    name: string,       
    regno: string,
    trade: string,
    batch: string,
    password: string,
}
class UserController {
    public register = asyncHandler(async (req: Request, res: Response) => {
        const { name, regno, trade, batch, password } = req.body as Register;

        // return res.status(400).json(new ApiError('Registration is closed! Contact your SPR', 400));

        if (!name ||  !regno || !trade || !batch || !password) {
            return res.status(400).json(new ApiError('All fields are required', 400));
        }

        const accessToken = generateJwt(regno);

        const client = await dbPool.connect();
        try {
            const { rows } = await client.query(
                `SELECT * FROM users WHERE regno = $1`,
                [regno]
            );
            if (rows.length > 0) {
                return res.status(400).json(new ApiError('User already exists', 400));
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const insertQuery = `
                INSERT INTO users (regno, name, trade, batch, password, access_token, role)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING regno
            `;
            const insertValues = [regno, name, trade, batch, hashedPassword, accessToken, "user"];
            const { rows: insertRows } = await client.query(insertQuery, insertValues);

            const message = 'User registered successfully';
            const data = insertRows[0];
            const apiResponse = new ApiResponse(message, 201, data);
            return res.status(201).json(apiResponse);
        } catch (err) {
            return res.status(500).json(new ApiError((err as Error).message, 500));
        } finally {
            client.release();
        }
    });

    public login = asyncHandler(async (req: Request, res: Response) => {
        const regno: string = req.body?.regno || '';
        const password: string = req.body?.password || '';

        const client = await dbPool.connect();
        try {
            const { rows } = await client.query(
                `SELECT * FROM users WHERE regno = $1`,
                [regno]
            );
            if (rows.length === 0) {
                return res.status(401).json(new ApiError('Invalid email or password', 400));
            }

            const user = rows[0];
            if (user?.blocked == 1) return res.status(401).json(new ApiError('You are blocked, Contact your respective JSPR.', 400));
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                return res.status(401).json(new ApiError('Invalid email or password', 400));
            }

            const accessToken = generateJwt(user.regno);
            const updateQuery = `
                UPDATE users
                SET access_token = $1,
                last_active = NOW()
                WHERE regno = $2
                RETURNING regno, name, trade, batch, access_token, role
            `;
            const updateValues = [accessToken, user.regno];
            const { rows: updateRows } = await client.query(updateQuery, updateValues);

            const message = 'User logged in successfully';
            const data = updateRows[0];
            const apiResponse = new ApiResponse(message, 200, data);
            return res.status(200).json(apiResponse);
        } catch (err) {
            return res.status(500).json(new ApiError((err as Error).message, 500));
        } finally {
            client.release();
        }
    });

    public verifySession = asyncHandler(async (req: Request, res: Response) => {
        let accessToken: string = req.headers.authorization || '';
        if (!accessToken) {
            return res.status(401).json(new ApiError('Invalid access token', 401));
        }
        accessToken = accessToken.replace('Bearer ', '');
        const client = await dbPool.connect();
        try {
            const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET!) as any;
            const regno = decodedToken.regno;

            const { rows } = await client.query(
                `SELECT regno, name, role, trade, batch, access_token FROM users WHERE regno = $1`,
                [regno]
            );
            if (rows.length === 0) {
                return res.status(401).json(new ApiError('Invalid access token', 401));
            }

            const user = rows[0];
            if (user.access_token !== accessToken) {
                return res.status(401).json(new ApiError('Invalid access token', 401));
            }

            // Update last active
            const updateQuery = `
                UPDATE users
                SET last_active = NOW()
                WHERE regno = $1
            `;
            await client.query(updateQuery, [regno]);

            const message = 'Session is valid';
            const data = user;
            const apiResponse = new ApiResponse(message, 200, data);
            return res.status(200).json(apiResponse);
        } catch (err) {
            return res.status(401).json(new ApiError('Invalid access token', 401));
        } finally {
            client.release();
        }
    });

    public generateOTP = asyncHandler(async (req: Request, res: Response) => {
    const { regno } = req.params;

    // Validate regno parameter
    if (!regno || regno.trim() === '') {
        return res.status(400).json(new ApiError("Registration number is required", 400));
    }

    console.log("DEBUG: Generating OTP for regno:", regno);

    try {
        // NOTE: Your schema shows 'users' table doesn't have 'email' column
        // You might need to use a different approach or add email column to schema
        
        // Option 1: If you have email column (you need to add it to schema first)
        const emailResult = await dbPool.query(`SELECT email FROM users WHERE regno = $1`, [regno]);
        
        // Check if user exists
        if (emailResult.rows.length === 0) {
            console.error("generateOTP: User not found for regno:", regno);
            return res.status(404).json(new ApiError("User not found", 404));
        }

        // Extract email from query result
        const userEmail = emailResult.rows[0].email;
        
        // Check if user has email
        if (!userEmail) {
            console.error("generateOTP: No email found for user:", regno);
            return res.status(400).json(new ApiError("Email not found for this user", 400));
        }

        console.log("DEBUG: Found email for user:", userEmail);

        // Generate 6-digit OTP
        let otp = "";
        for (let i = 0; i < 6; i++) {
            otp += Math.floor(Math.random() * 10);
        }

        console.log("DEBUG: Generated OTP:", otp);

        // Store OTP in Redis with 5-minute expiration
        const setOTP = await redisClient.set(
            `otp:${regno}`,
            otp,
            { EX: 300 }
        );

        if (!setOTP) {
            console.error("generateOTP: Failed to store OTP in Redis for regno:", regno);
            return res.status(500).json(new ApiError("Unable to save OTP", 500));
        }

        console.log("DEBUG: OTP stored in Redis successfully");

        // Send email with OTP
        const emailSent = await sendMail(userEmail, "OTP for Password Change", otpFormat(otp));
        
        if (!emailSent) {
            console.error("generateOTP: Failed to send email to:", userEmail);
            // Clean up Redis entry if email fails
            await redisClient.del(`otp:${regno}`);
            return res.status(500).json(new ApiError("Unable to send OTP to email", 500));
        }

        console.log("DEBUG: OTP email sent successfully to:", userEmail);

        return res.status(200).json(
            new ApiResponse("OTP sent to your registered email", 200, { 
                message: "Please check your email for the OTP",
                expiresIn: "5 minutes"
            })
        );

    } catch (error) {
        console.error("Error in generateOTP:", error);
        
        // Clean up any Redis entries in case of error
        try {
            await redisClient.del(`otp:${regno}`);
        } catch (redisError) {
            console.error("Error cleaning up Redis:", redisError);
        }
        
        return res.status(500).json(new ApiError((error as Error).message, 500));
    }
});

    public forgotPass = asyncHandler(async (req: Request, res: Response) => {
        const { regno, password, otp } = req.body;

        try {
            const dbOTP = await redisClient.get(`otp:${regno}`);
            console.log(dbOTP, otp);
            if (dbOTP != otp) return res.status(403).json(new ApiError("Invalid OTP", 403));

            // Change password
            const hashPass = await bcrypt.hash(password, 10);

            const query = `UPDATE users SET password=$1 WHERE regno=$2`;

            const { rows } = await dbPool.query(query, [hashPass, regno]);
            return res.status(200).json(new ApiResponse("Password Changed Successfully", 200, []));
        } catch (error) {
            res.status(500).json(new ApiError((error as Error).message, 500));
        }
    });

    public uploadAvatar = asyncHandler(async (req: CustomRequest, res: Response) => {
        const userData = req.user;
        const avatar = req.file?.path || '';
        if (!avatar) return res.status(400).json(new ApiError("Avatar is required", 400));
        const client = await dbPool.connect();
        const uploadedUrl = await uploadOnCloud.upload(avatar, "avatars");
        try {
            const { rows } = await client.query(
                `UPDATE users SET avatar = $1 WHERE regno = $2 RETURNING avatar`,
                [uploadedUrl, userData.regno]
            );
            const data = rows[0];
            return res.status(200).json(new ApiResponse('Avatar uploaded successfully', 200, uploadedUrl));
        } catch (err) {
            return res.status(500).json(new ApiError((err as Error).message, 500));
        } finally {
            client.release();
        }
    });

    public getUserDashboard = asyncHandler(async (req: CustomRequest, res: Response) => {
        const userData = req.user;
        const client = await dbPool.connect();
        console.log("DEBUG: User data from request:", userData);
        if (!userData.regno) {
            client.release();
            return res.status(401).json(new ApiError("Unauthorized Request", 401));
        }
        try {
            console.log("DEBUG: Fetching dashboard for regno:", userData.regno);

            // Include email in the user details query
            const userDetailsResult = await client.query(
                `SELECT regno, name, email, trade, batch, avatar FROM users WHERE regno = $1`,
                [userData.regno]
            );
            console.log("DEBUG: User details result:", userDetailsResult.rows);
            const userDetails = userDetailsResult?.rows[0];
            if (!userDetails) {
                return res.status(404).json(new ApiError('User not found', 404));
            }

            // 2. Test Stats
            const testStatsResult = await client.query(
                `SELECT 
                    COUNT(ur.id) AS total_tests_taken,
                    ROUND(AVG((ur.marks::DECIMAL / NULLIF(at.total_questions, 0)) * 100), 2) AS average_score
                FROM user_responses ur
                JOIN aptitude_tests at ON ur.aptitude_test_id = at.id
                WHERE ur.regno = $1`,
                [userData.regno]
            );
            console.log("DEBUG: Test stats result:", testStatsResult.rows);
            const testStats = testStatsResult?.rows[0];

            // 3. Last Test Details
            const lastTestResult = await client.query(
                `SELECT 
                    at.id AS test_id,
                    at.name AS test_name, 
                    at.test_timestamp,
                    at.duration,
                    at.total_questions AS total_score,
                    ur.marks AS score
                FROM user_responses ur
                JOIN aptitude_tests at ON ur.aptitude_test_id = at.id
                WHERE ur.regno = $1
                ORDER BY ur.id DESC
                LIMIT 1`,
                [userData.regno]
            );
            console.log("DEBUG: Last test result:", lastTestResult.rows);
            const lastTest = lastTestResult?.rows[0];

            // 4. Recent Tests (limit 5)
            const recentTestsResult = await client.query(
                `SELECT 
                    at.name AS test_name, 
                    at.test_timestamp, 
                    ur.marks AS score,
                    at.total_questions AS total_score
                FROM user_responses ur
                JOIN aptitude_tests at ON ur.aptitude_test_id = at.id
                WHERE ur.regno = $1
                ORDER BY ur.id DESC
                LIMIT 5`, 
                [userData.regno]
            );
            console.log("DEBUG: Recent tests result:", recentTestsResult.rows);
            const recentTests = recentTestsResult?.rows;

            // 5. Topic Analysis Query (updated)
            const topicAnalysisQuery = `
                WITH parsed_answers AS (
                    SELECT 
                        ur.regno,
                        (answer_element->>'question_id')::int as question_id,
                        -- Handle both single selected_option and multiple selected_options
                        CASE 
                            WHEN answer_element ? 'selected_option' THEN 
                                ARRAY[(answer_element->>'selected_option')::int]
                            WHEN answer_element ? 'selected_options' THEN
                                ARRAY(SELECT jsonb_array_elements_text(answer_element->'selected_options')::int)
                            ELSE ARRAY[]::int[]
                        END as user_selections
                    FROM user_responses ur
                    CROSS JOIN LATERAL jsonb_array_elements(ur.answers::jsonb) as answer_element
                    WHERE ur.regno = $1
                )
                SELECT 
                    topic,
                    COUNT(DISTINCT q.id) AS total_questions,
                    COUNT(pa.question_id) AS total_solved,
                    SUM(
                        CASE 
                            WHEN pa.user_selections @> ARRAY[q.correct_option]
                            THEN 1 ELSE 0 
                        END
                    ) AS correct_answers,
                    COUNT(pa.question_id) - SUM(
                        CASE 
                            WHEN pa.user_selections @> ARRAY[q.correct_option]
                            THEN 1 ELSE 0 
                        END
                    ) AS incorrect_answers,
                    CASE 
                        WHEN COUNT(pa.question_id) > 0 THEN
                            ROUND(
                                SUM(
                                    CASE 
                                        WHEN pa.user_selections @> ARRAY[q.correct_option]
                                        THEN 1 ELSE 0 
                                    END
                                )::DECIMAL * 100.0 / COUNT(pa.question_id),
                                2
                            )
                        ELSE 0
                    END AS accuracy
                FROM parsed_answers pa
                JOIN questions q ON q.id = pa.question_id
                CROSS JOIN LATERAL unnest(q.topic_tags) AS topic
                GROUP BY topic
                ORDER BY topic;
            `;

            const topicAnalysisResult = await client.query(topicAnalysisQuery, [userData.regno]);
            console.log("DEBUG: Topic analysis result:", topicAnalysisResult.rows);
            const topicAnalysis = topicAnalysisResult?.rows;

            const response = {
                userDetails,
                testStats,
                lastTest,
                recentTests,
                topicAnalysis
            };
            return res.status(200).json(new ApiResponse('User dashboard data', 200, response));
        } catch (err) {
            console.error("Dashboard Error:", err);
            return res.status(500).json(new ApiError((err as Error).message, 500));
        } finally {
            client.release();
        }
    });

    public blockUser = asyncHandler(async (req: CustomRequest, res: Response) => {
        const users: string[] = req.body.users || [];
        const isJspr = req.user.role === 'jspr';
        try {
            // check if all regno are of the same trade as jspr
            if (isJspr) {
                const { rows } = await dbPool.query(`SELECT trade FROM users WHERE regno = ANY($1)`, [users]);
                for (let row of rows) {
                    if (row.trade !== req.user.trade) return res.status(401).json(new ApiError("You can block only of your branch", 401));
                }
            }

            const query = `UPDATE users SET blocked = 1 WHERE regno = ANY($1)`;
            const { rowCount } = await dbPool.query(query, [users]);
            if (rowCount === 0) return res.status(404).json(new ApiError("No user found", 404));
            return res.status(200).json(new ApiResponse("Users Blocked Successfuly", 200, users));
        } catch (error) {
            return res.status(500).json(new ApiError((error as Error).message, 500));
        }
    });

    public unblockUser = asyncHandler(async (req: CustomRequest, res: Response) => {
        const users: string[] = req.body.users || [];
        const isJspr = req.user.role === 'jspr';
        try {
            if (isJspr) {
                const { rows } = await dbPool.query(`SELECT trade FROM users WHERE regno = ANY($1)`, [users]);
                for (let row of rows) {
                    if (row.trade !== req.user.trade) return res.status(401).json(new ApiError("You can unblock only of your branch", 401));
                }
            }

            const query = `UPDATE users SET blocked = 0 WHERE regno = ANY($1)`;
            const { rowCount } = await dbPool.query(query, [users]);
            if (rowCount === 0) return res.status(404).json(new ApiError("No user found", 404));
            return res.status(200).json(new ApiResponse("Users unblocked Successfuly", 200, users));
        } catch (error) {
            return res.status(500).json(new ApiError((error as Error).message, 500));
        }
    });

    public getBlockedUsers = asyncHandler(async (req: CustomRequest, res: Response) => {
        const trade = req.query?.trade || '';

        if (trade && req.user.role == 'jspr' && req.user.trade != trade) return res.status(401).json(new ApiError("You can view only of your branch", 401));

        try {
            let query = `SELECT regno, name, trade FROM users WHERE blocked=$1`;
            let options: any[] = [1];

            if (req.user.role === 'jspr') {
                query += ` AND trade=$2`;
                options.push(req.user.trade);
            }
            else if (trade && req.user.role === 'admin') {
                query += ` AND trade=$2`;
                options.push(trade);
            }
            const { rows } = await dbPool.query(query, options);
            if (rows.length == 0) return res.status(404).json(new ApiError("No user found", 404));
            return res.status(200).json(new ApiResponse('Blocked Users...', 200, rows));

        } catch (error) {
            return res.status(500).json(new ApiError((error as Error).message, 500));
        }
    });

    public addJsprs = asyncHandler(async (req: Request, res: Response) => {
        const regnos: string[] = req.body.regnos;

        if (!regnos || regnos.length === 0) {
            return res.status(400).json(new ApiError("No registration numbers provided", 400));
        }

        const client = await dbPool.connect();
        try {
            // update role in users table 
            const query = `UPDATE users SET role = 'jspr' WHERE regno = ANY($1)`; // update role to jspr
            const { rowCount } = await client.query(query, [regnos]);
            if (rowCount === 0) return res.status(404).json(new ApiError("No user found", 404));
            return res.status(200).json(new ApiResponse("JSPRs added successfully", 200, regnos));
        } catch (error) {
            return res.status(500).json(new ApiError((error as Error).message, 500));
        } finally {
            client.release();
        }
    });

    getJsprs = asyncHandler(async (req: Request, res: Response) => {
        const batch = req.query?.batch || '';
        console.log(batch); 
        try {
            // join with users and group by trade
            const { rows } = await dbPool.query(`SELECT regno, name, mobile, trade, avatar, batch FROM users WHERE batch=$1 AND (role = 'jspr' OR role = 'admin')`, [batch]);
            if (rows.length === 0) return res.status(404).json(new ApiError("No JSPR found", 404));
            return res.status(200).json(new ApiResponse('JSPRs...', 200, rows));
        } catch (error) {
            return res.status(500).json(new ApiError((error as Error).message, 500));
        }

    });

    changePassword = asyncHandler(async (req: CustomRequest, res: Response) => {
        const { oldPassword, newPassword, regno } = req.body;
        const userData = req.user;
        const isAdmin = userData.role === 'admin';
        const client = await dbPool.connect();
        try {
            const { rows } = await client.query(
                `SELECT * FROM users WHERE regno = $1`,
                [regno]
            );
            if (rows.length === 0) {
                return res.status(401).json(new ApiError('User is not Registered', 400));
            }
            const user = rows[0];
            if (user.role == 'admin' && userData.regno != user.regno) return res.status(401).json(new ApiError('Unauthorized Request', 401));

            const isPasswordMatch = await bcrypt.compare(oldPassword, user.password) || isAdmin;
            if (!isPasswordMatch) {
                return res.status(401).json(new ApiError('Invalid old password', 400));
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const updateQuery = `
                UPDATE users
                SET password = $1
                WHERE regno = $2
                RETURNING regno, name, trade, batch, role
            `;
            const updateValues = [hashedPassword, user.regno];
            const { rows: updateRows } = await client.query(updateQuery, updateValues);

            const message = 'Password changed successfully';
            const data = updateRows[0];
            const apiResponse = new ApiResponse(message, 200, data);
            return res.status(200).json(apiResponse);
        } catch (err) {
            return res.status(500).json(new ApiError((err as Error).message, 500));
        } finally {
            client.release();
        }
    })

    public editProfile = asyncHandler(async (req: CustomRequest, res: Response) => {
        // Make sure req.user exists and has regno
        if (!req.user || !req.user.regno) {
            console.error("editProfile: Missing authentication data in req.user");
            return res.status(401).json(new ApiError("Unauthorized Request", 401));
        }
        const userData = req.user;
        const data =req.body;
        console.log("DEBUG: Received editProfile payload:", { regno: userData.regno,data });
        
        // Basic validation
        if (!data) {
            console.error("editProfile: Missing mobile or email in payload");
            return res.status(400).json(new ApiError("Mobile and email are required", 400));
        }
        
        try {
            const client = await dbPool.connect();
            try {
                const query = `
                    UPDATE users 
                    SET mobile = $1, email = $2 
                    WHERE regno = $3 
                    RETURNING regno, name, email, trade, batch, mobile
                `;
                const values = [data.mobile.mobile,data.mobile.email, userData.regno];
                console.log("DEBUG: Running query", query, "with values", values);
                
                const { rows } = await client.query(query, values);
                console.log("DEBUG: Updated user record:", rows);
                
                if (!rows.length) {
                    console.error("editProfile: No user record updated for regno", userData.regno);
                    return res.status(404).json(new ApiError("User not found", 404));
                }
                return res.status(200).json(new ApiResponse("Profile updated successfully", 200, rows[0]));
            } finally {
              client.release();
            }
          } catch (error) {
            console.error("Error in editProfile:", error);
            return res.status(500).json(new ApiError((error as Error).message, 500));
          }
    });

    public updateWarnings = asyncHandler(async (req: CustomRequest, res: Response) => {
        const { regno, aptitude_test_id, warnings } = req.body;

        if (!regno || !aptitude_test_id || warnings === undefined) {
            return res.status(400).json(new ApiError("Missing required fields", 400));
        }

        const client = await dbPool.connect();
        try {
            const result = await client.query(
                `
                UPDATE user_responses
                SET warnings = $1
                WHERE regno = $2 AND aptitude_test_id = $3
                `,
                [warnings, regno, aptitude_test_id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json(new ApiError("User response not found", 404));
            }

            return res.status(200).json(new ApiResponse("Warnings updated successfully", 200, { warnings }));
        } catch (error) {
            console.error("Failed to update warnings:", error);
            return res.status(500).json(new ApiError("Failed to update warnings", 500));
        } finally {
            client.release();
        }
    });
}

export default new UserController();
