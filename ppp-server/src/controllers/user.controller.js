"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ApiResponse_1 = require("../utils/ApiResponse");
var ApiError_1 = require("../utils/ApiError");
var asyncHandler_1 = require("../utils/asyncHandler");
var pg_connection_1 = require("../connections/pg-connection");
var bcrypt_1 = require("bcrypt");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var jsonwebtoken_1 = require("jsonwebtoken");
var redis_connection_1 = require("../connections/redis-connection");
var OTPFormat_1 = require("../utils/mail/OTPFormat");
var sendMail_1 = require("../utils/mail/sendMail");
var uploadOnCloud_1 = require("../utils/uploadOnCloud");
var UserController = /** @class */ (function () {
    function UserController() {
        var _this = this;
        this.register = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, name, regno, trade, batch, password, accessToken, client, rows, hashedPassword, insertQuery, insertValues, insertRows, message, data, apiResponse, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.body, name = _a.name, regno = _a.regno, trade = _a.trade, batch = _a.batch, password = _a.password;
                        // return res.status(400).json(new ApiError('Registration is closed! Contact your SPR', 400));
                        if (!name || !regno || !trade || !batch || !password) {
                            return [2 /*return*/, res.status(400).json(new ApiError_1.default('All fields are required', 400))];
                        }
                        accessToken = (0, auth_middleware_1.generateJwt)(regno);
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, 7, 8]);
                        return [4 /*yield*/, client.query("SELECT * FROM users WHERE regno = $1", [regno])];
                    case 3:
                        rows = (_b.sent()).rows;
                        if (rows.length > 0) {
                            return [2 /*return*/, res.status(400).json(new ApiError_1.default('User already exists', 400))];
                        }
                        return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
                    case 4:
                        hashedPassword = _b.sent();
                        insertQuery = "\n                INSERT INTO users (regno, name, trade, batch, password, access_token, role)\n                VALUES ($1, $2, $3, $4, $5, $6, $7)\n                RETURNING regno\n            ";
                        insertValues = [regno, name, trade, batch, hashedPassword, accessToken, "user"];
                        return [4 /*yield*/, client.query(insertQuery, insertValues)];
                    case 5:
                        insertRows = (_b.sent()).rows;
                        message = 'User registered successfully';
                        data = insertRows[0];
                        apiResponse = new ApiResponse_1.default(message, 201, data);
                        return [2 /*return*/, res.status(201).json(apiResponse)];
                    case 6:
                        err_1 = _b.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(err_1.message, 500))];
                    case 7:
                        client.release();
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
        this.login = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var regno, password, client, rows, user, isPasswordMatch, accessToken, updateQuery, updateValues, updateRows, message, data, apiResponse, err_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        regno = ((_a = req.body) === null || _a === void 0 ? void 0 : _a.regno) || '';
                        password = ((_b = req.body) === null || _b === void 0 ? void 0 : _b.password) || '';
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _c.sent();
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, 7, 8]);
                        return [4 /*yield*/, client.query("SELECT * FROM users WHERE regno = $1", [regno])];
                    case 3:
                        rows = (_c.sent()).rows;
                        if (rows.length === 0) {
                            return [2 /*return*/, res.status(401).json(new ApiError_1.default('Invalid email or password', 400))];
                        }
                        user = rows[0];
                        if ((user === null || user === void 0 ? void 0 : user.blocked) == 1)
                            return [2 /*return*/, res.status(401).json(new ApiError_1.default('You are blocked, Contact your respective JSPR.', 400))];
                        return [4 /*yield*/, bcrypt_1.default.compare(password, user.password)];
                    case 4:
                        isPasswordMatch = _c.sent();
                        if (!isPasswordMatch) {
                            return [2 /*return*/, res.status(401).json(new ApiError_1.default('Invalid email or password', 400))];
                        }
                        accessToken = (0, auth_middleware_1.generateJwt)(user.regno);
                        updateQuery = "\n                UPDATE users\n                SET access_token = $1,\n                last_active = NOW()\n                WHERE regno = $2\n                RETURNING regno, name, trade, batch, access_token, role\n            ";
                        updateValues = [accessToken, user.regno];
                        return [4 /*yield*/, client.query(updateQuery, updateValues)];
                    case 5:
                        updateRows = (_c.sent()).rows;
                        message = 'User logged in successfully';
                        data = updateRows[0];
                        apiResponse = new ApiResponse_1.default(message, 200, data);
                        return [2 /*return*/, res.status(200).json(apiResponse)];
                    case 6:
                        err_2 = _c.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(err_2.message, 500))];
                    case 7:
                        client.release();
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
        this.verifySession = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var accessToken, client, decodedToken, regno, rows, user, updateQuery, message, data, apiResponse, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accessToken = req.headers.authorization || '';
                        if (!accessToken) {
                            return [2 /*return*/, res.status(401).json(new ApiError_1.default('Invalid access token', 401))];
                        }
                        accessToken = accessToken.replace('Bearer ', '');
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, 6, 7]);
                        decodedToken = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_SECRET);
                        regno = decodedToken.regno;
                        return [4 /*yield*/, client.query("SELECT regno, name, role, trade, batch, access_token FROM users WHERE regno = $1", [regno])];
                    case 3:
                        rows = (_a.sent()).rows;
                        if (rows.length === 0) {
                            return [2 /*return*/, res.status(401).json(new ApiError_1.default('Invalid access token', 401))];
                        }
                        user = rows[0];
                        if (user.access_token !== accessToken) {
                            return [2 /*return*/, res.status(401).json(new ApiError_1.default('Invalid access token', 401))];
                        }
                        updateQuery = "\n                UPDATE users\n                SET last_active = NOW()\n                WHERE regno = $1\n            ";
                        return [4 /*yield*/, client.query(updateQuery, [regno])];
                    case 4:
                        _a.sent();
                        message = 'Session is valid';
                        data = user;
                        apiResponse = new ApiResponse_1.default(message, 200, data);
                        return [2 /*return*/, res.status(200).json(apiResponse)];
                    case 5:
                        err_3 = _a.sent();
                        return [2 /*return*/, res.status(401).json(new ApiError_1.default('Invalid access token', 401))];
                    case 6:
                        client.release();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        this.generateOTP = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var regno, email, otp, i, setOTP, ms, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        regno = req.params.regno;
                        email = regno + "@sliet.ac.in";
                        otp = "";
                        for (i = 0; i < 6; i++) {
                            otp += Math.floor(Math.random() * 10);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, redis_connection_1.redisClient.set("otp:".concat(regno), otp, { EX: 300 })];
                    case 2:
                        setOTP = _a.sent();
                        if (!setOTP)
                            return [2 /*return*/, res.status(500).json(new ApiError_1.default("Unable to save OTP", 500))];
                        return [4 /*yield*/, (0, sendMail_1.sendMail)(email.trim(), "OTP for Password Change", (0, OTPFormat_1.otpFormat)(otp))];
                    case 3:
                        ms = _a.sent();
                        if (!ms)
                            return [2 /*return*/, res.status(500).json(new ApiError_1.default("Unable to send OTP to mail", 500))];
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default("OTP sent to you SLIET email", 200, []))];
                    case 4:
                        error_1 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_1.message, 500))];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        this.forgotPass = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, regno, password, otp, dbOTP, hashPass, query, rows, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.body, regno = _a.regno, password = _a.password, otp = _a.otp;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, redis_connection_1.redisClient.get("otp:".concat(regno))];
                    case 2:
                        dbOTP = _b.sent();
                        console.log(dbOTP, otp);
                        if (dbOTP != otp)
                            return [2 /*return*/, res.status(403).json(new ApiError_1.default("Invalid OTP", 403))];
                        return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
                    case 3:
                        hashPass = _b.sent();
                        query = "UPDATE users SET password=$1 WHERE regno=$2";
                        return [4 /*yield*/, pg_connection_1.dbPool.query(query, [hashPass, regno])];
                    case 4:
                        rows = (_b.sent()).rows;
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default("Password Changed Successfully", 200, []))];
                    case 5:
                        error_2 = _b.sent();
                        res.status(500).json(new ApiError_1.default(error_2.message, 500));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        this.uploadAvatar = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var userData, avatar, client, uploadedUrl, rows, data, err_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        userData = req.user;
                        avatar = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) || '';
                        if (!avatar)
                            return [2 /*return*/, res.status(400).json(new ApiError_1.default("Avatar is required", 400))];
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _b.sent();
                        return [4 /*yield*/, uploadOnCloud_1.default.upload(avatar, "avatars")];
                    case 2:
                        uploadedUrl = _b.sent();
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, 6, 7]);
                        return [4 /*yield*/, client.query("UPDATE users SET avatar = $1 WHERE regno = $2 RETURNING avatar", [uploadedUrl, userData.regno])];
                    case 4:
                        rows = (_b.sent()).rows;
                        data = rows[0];
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Avatar uploaded successfully', 200, uploadedUrl))];
                    case 5:
                        err_4 = _b.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(err_4.message, 500))];
                    case 6:
                        client.release();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        this.getUserDashboard = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var userData, client, userDetailsResult, userDetails, testStatsResult, testStats, lastTestResult, lastTest, recentTestsResult, recentTests, topicAnalysisResult, topicAnalysis, response, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userData = req.user;
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _a.sent();
                        if (!userData.regno)
                            return [2 /*return*/, res.status(401).json(new ApiError_1.default("Unauthorized Request", 401))];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 9, 10, 11]);
                        return [4 /*yield*/, client.query("SELECT regno,name,trade,batch,avatar FROM users WHERE regno = $1", [userData.regno])];
                    case 3:
                        userDetailsResult = _a.sent();
                        userDetails = userDetailsResult === null || userDetailsResult === void 0 ? void 0 : userDetailsResult.rows[0];
                        if (!userDetails) {
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default('User not found', 404))];
                        }
                        return [4 /*yield*/, client.query("SELECT \n                COUNT(ur.id) AS total_tests_taken, -- Total tests taken by the user\n                ROUND(AVG((ur.marks::DECIMAL / NULLIF(at.total_questions, 0)) * 100), 2) AS average_score -- Average score in percentage\n                FROM user_responses ur\n                JOIN aptitude_tests at ON ur.aptitude_test_id = at.id\n                WHERE ur.regno = $1", [userData.regno])];
                    case 4:
                        testStatsResult = _a.sent();
                        testStats = testStatsResult === null || testStatsResult === void 0 ? void 0 : testStatsResult.rows[0];
                        return [4 /*yield*/, client.query("SELECT \t\t\t\n                at.id AS test_id,\n                at.name AS test_name, \n\t\t\t\tat.test_timestamp,\n\t\t\t\tat.duration,\n                at.total_questions AS total_score,\n                ur.marks AS score\n                FROM user_responses ur\n                JOIN aptitude_tests at ON ur.aptitude_test_id = at.id\n                WHERE ur.regno = $1\n                ORDER BY ur.id DESC\n                LIMIT 1", [userData.regno])];
                    case 5:
                        lastTestResult = _a.sent();
                        lastTest = lastTestResult === null || lastTestResult === void 0 ? void 0 : lastTestResult.rows[0];
                        return [4 /*yield*/, client.query("\n                SELECT \n                at.name AS test_name, \n                at.test_timestamp, \n                ur.marks AS score,\n                at.total_questions AS total_score\n                FROM user_responses ur\n                JOIN aptitude_tests at ON ur.aptitude_test_id = at.id\n                WHERE ur.regno = $1\n                ORDER BY ur.id DESC\n                LIMIT 5 \n                ", [userData.regno])];
                    case 6:
                        recentTestsResult = _a.sent();
                        recentTests = recentTestsResult === null || recentTestsResult === void 0 ? void 0 : recentTestsResult.rows;
                        return [4 /*yield*/, client.query("SELECT \n                    unnest(q.topic_tags) AS topic, -- Break down by individual topic\n                    COUNT(q.id) AS total_questions, -- Total questions available for the topic\n                    COUNT(parsed_data.question_id) AS total_solved, -- Total questions solved by the user\n                    SUM(CASE WHEN \n                        (answers_array->>'selected_options' IS NOT NULL AND \n                         (answers_array->'selected_options')::int[] && q.correct_option) OR\n                        (answers_array->>'selected_option' IS NOT NULL AND \n                         CAST(answers_array->>'selected_option' AS INT) = ANY(q.correct_option))\n                    THEN 1 ELSE 0 END) AS correct_answers, -- Correct answers\n                    COUNT(parsed_data.question_id) - \n                    SUM(CASE WHEN \n                        (answers_array->>'selected_options' IS NOT NULL AND \n                         (answers_array->'selected_options')::int[] && q.correct_option) OR\n                        (answers_array->>'selected_option' IS NOT NULL AND \n                         CAST(answers_array->>'selected_option' AS INT) = ANY(q.correct_option))\n                    THEN 1 ELSE 0 END) AS incorrect_answers, -- Incorrect answers\n                    ROUND(\n                        SUM(CASE WHEN \n                            (answers_array->>'selected_options' IS NOT NULL AND \n                             (answers_array->'selected_options')::int[] && q.correct_option) OR\n                            (answers_array->>'selected_option' IS NOT NULL AND \n                             CAST(answers_array->>'selected_option' AS INT) = ANY(q.correct_option))\n                        THEN 1 ELSE 0 END)::DECIMAL * 100 / NULLIF(COUNT(parsed_data.question_id), 0),\n                        2\n                    ) AS accuracy -- Accuracy percentage\n                FROM user_responses ur\n                CROSS JOIN LATERAL jsonb_array_elements(ur.answers::jsonb) AS answers_array\n                CROSS JOIN LATERAL (\n                    SELECT \n                        (answers_array->>'question_id')::INT AS question_id\n                ) AS parsed_data\n                JOIN questions q ON q.id = parsed_data.question_id\n                WHERE ur.regno = $1 -- Filter by user's registration number\n                GROUP BY unnest(q.topic_tags);", [userData.regno])];
                    case 7:
                        topicAnalysisResult = _a.sent();
                        return [4 /*yield*/, topicAnalysisResult];
                    case 8:
                        topicAnalysis = (_a.sent()).rows;
                        response = {
                            userDetails: userDetails,
                            testStats: testStats,
                            lastTest: lastTest,
                            recentTests: recentTests,
                            topicAnalysis: topicAnalysis
                        };
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('User dashboard data', 200, response))];
                    case 9:
                        err_5 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(err_5.message, 500))];
                    case 10:
                        client.release();
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        }); });
        this.blockUser = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var users, isJspr, rows, _i, rows_1, row, query, rowCount, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        users = req.body.users || [];
                        isJspr = req.user.role === 'jspr';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        if (!isJspr) return [3 /*break*/, 3];
                        return [4 /*yield*/, pg_connection_1.dbPool.query("SELECT trade FROM users WHERE regno = ANY($1)", [users])];
                    case 2:
                        rows = (_a.sent()).rows;
                        for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                            row = rows_1[_i];
                            if (row.trade !== req.user.trade)
                                return [2 /*return*/, res.status(401).json(new ApiError_1.default("You can block only of your branch", 401))];
                        }
                        _a.label = 3;
                    case 3:
                        query = "UPDATE users SET blocked = 1 WHERE regno = ANY($1)";
                        return [4 /*yield*/, pg_connection_1.dbPool.query(query, [users])];
                    case 4:
                        rowCount = (_a.sent()).rowCount;
                        if (rowCount === 0)
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default("No user found", 404))];
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default("Users Blocked Successfuly", 200, users))];
                    case 5:
                        error_3 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_3.message, 500))];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        this.unblockUser = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var users, isJspr, rows, _i, rows_2, row, query, rowCount, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        users = req.body.users || [];
                        isJspr = req.user.role === 'jspr';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        if (!isJspr) return [3 /*break*/, 3];
                        return [4 /*yield*/, pg_connection_1.dbPool.query("SELECT trade FROM users WHERE regno = ANY($1)", [users])];
                    case 2:
                        rows = (_a.sent()).rows;
                        for (_i = 0, rows_2 = rows; _i < rows_2.length; _i++) {
                            row = rows_2[_i];
                            if (row.trade !== req.user.trade)
                                return [2 /*return*/, res.status(401).json(new ApiError_1.default("You can unblock only of your branch", 401))];
                        }
                        _a.label = 3;
                    case 3:
                        query = "UPDATE users SET blocked = 0 WHERE regno = ANY($1)";
                        return [4 /*yield*/, pg_connection_1.dbPool.query(query, [users])];
                    case 4:
                        rowCount = (_a.sent()).rowCount;
                        if (rowCount === 0)
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default("No user found", 404))];
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default("Users unblocked Successfuly", 200, users))];
                    case 5:
                        error_4 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_4.message, 500))];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        this.getBlockedUsers = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var trade, query, options, rows, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        trade = ((_a = req.query) === null || _a === void 0 ? void 0 : _a.trade) || '';
                        if (trade && req.user.role == 'jspr' && req.user.trade != trade)
                            return [2 /*return*/, res.status(401).json(new ApiError_1.default("You can view only of your branch", 401))];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        query = "SELECT regno, name, trade FROM users WHERE blocked=$1";
                        options = [1];
                        if (req.user.role === 'jspr') {
                            query += " AND trade=$2";
                            options.push(req.user.trade);
                        }
                        else if (trade && req.user.role === 'admin') {
                            query += " AND trade=$2";
                            options.push(trade);
                        }
                        return [4 /*yield*/, pg_connection_1.dbPool.query(query, options)];
                    case 2:
                        rows = (_b.sent()).rows;
                        if (rows.length == 0)
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default("No user found", 404))];
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Blocked Users...', 200, rows))];
                    case 3:
                        error_5 = _b.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_5.message, 500))];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        this.addJsprs = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var regnos, client, query, rowCount, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        regnos = req.body.regnos;
                        if (!regnos || regnos.length === 0) {
                            return [2 /*return*/, res.status(400).json(new ApiError_1.default("No registration numbers provided", 400))];
                        }
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 6]);
                        query = "UPDATE users SET role = 'jspr' WHERE regno = ANY($1)";
                        return [4 /*yield*/, client.query(query, [regnos])];
                    case 3:
                        rowCount = (_a.sent()).rowCount;
                        if (rowCount === 0)
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default("No user found", 404))];
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default("JSPRs added successfully", 200, regnos))];
                    case 4:
                        error_6 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_6.message, 500))];
                    case 5:
                        client.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        this.getJsprs = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var batch, rows, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        batch = ((_a = req.query) === null || _a === void 0 ? void 0 : _a.batch) || '';
                        console.log(batch);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, pg_connection_1.dbPool.query("SELECT regno, name, mobile, trade, avatar, batch FROM users WHERE batch=$1 AND (role = 'jspr' OR role = 'admin')", [batch])];
                    case 2:
                        rows = (_b.sent()).rows;
                        if (rows.length === 0)
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default("No JSPR found", 404))];
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('JSPRs...', 200, rows))];
                    case 3:
                        error_7 = _b.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_7.message, 500))];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        this.changePassword = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, oldPassword, newPassword, regno, userData, isAdmin, client, rows, user, isPasswordMatch, hashedPassword, updateQuery, updateValues, updateRows, message, data, apiResponse, err_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.body, oldPassword = _a.oldPassword, newPassword = _a.newPassword, regno = _a.regno;
                        userData = req.user;
                        isAdmin = userData.role === 'admin';
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, 8, 9]);
                        return [4 /*yield*/, client.query("SELECT * FROM users WHERE regno = $1", [regno])];
                    case 3:
                        rows = (_b.sent()).rows;
                        if (rows.length === 0) {
                            return [2 /*return*/, res.status(401).json(new ApiError_1.default('User is not Registered', 400))];
                        }
                        user = rows[0];
                        if (user.role == 'admin' && userData.regno != user.regno)
                            return [2 /*return*/, res.status(401).json(new ApiError_1.default('Unauthorized Request', 401))];
                        return [4 /*yield*/, bcrypt_1.default.compare(oldPassword, user.password)];
                    case 4:
                        isPasswordMatch = (_b.sent()) || isAdmin;
                        if (!isPasswordMatch) {
                            return [2 /*return*/, res.status(401).json(new ApiError_1.default('Invalid old password', 400))];
                        }
                        return [4 /*yield*/, bcrypt_1.default.hash(newPassword, 10)];
                    case 5:
                        hashedPassword = _b.sent();
                        updateQuery = "\n                UPDATE users\n                SET password = $1\n                WHERE regno = $2\n                RETURNING regno, name, trade, batch, role\n            ";
                        updateValues = [hashedPassword, user.regno];
                        return [4 /*yield*/, client.query(updateQuery, updateValues)];
                    case 6:
                        updateRows = (_b.sent()).rows;
                        message = 'Password changed successfully';
                        data = updateRows[0];
                        apiResponse = new ApiResponse_1.default(message, 200, data);
                        return [2 /*return*/, res.status(200).json(apiResponse)];
                    case 7:
                        err_6 = _b.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(err_6.message, 500))];
                    case 8:
                        client.release();
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        }); });
        this.editProfile = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var userData, mobile, client, rows, data, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userData = req.user;
                        mobile = req.body.mobile;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 2:
                        client = _a.sent();
                        return [4 /*yield*/, client.query("UPDATE users SET mobile = $1 WHERE regno = $2 RETURNING regno, name, trade, batch, mobile", [mobile, userData.regno])];
                    case 3:
                        rows = (_a.sent()).rows;
                        data = rows[0];
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Profile updated successfully', 200, data))];
                    case 4:
                        error_8 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default("Internal Server Error", 500))];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        this.updateWarnings = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, regno, aptitude_test_id, warnings, client, result, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.body, regno = _a.regno, aptitude_test_id = _a.aptitude_test_id, warnings = _a.warnings;
                        if (!regno || !aptitude_test_id || warnings === undefined) {
                            return [2 /*return*/, res.status(400).json(new ApiError_1.default("Missing required fields", 400))];
                        }
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, 5, 6]);
                        return [4 /*yield*/, client.query("\n                UPDATE user_responses\n                SET warnings = $1\n                WHERE regno = $2 AND aptitude_test_id = $3\n                ", [warnings, regno, aptitude_test_id])];
                    case 3:
                        result = _b.sent();
                        if (result.rowCount === 0) {
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default("User response not found", 404))];
                        }
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default("Warnings updated successfully", 200, { warnings: warnings }))];
                    case 4:
                        error_9 = _b.sent();
                        console.error("Failed to update warnings:", error_9);
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default("Failed to update warnings", 500))];
                    case 5:
                        client.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
    }
    return UserController;
}());
exports.default = new UserController();
