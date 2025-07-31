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
var asyncHandler_1 = require("../utils/asyncHandler");
var pg_connection_1 = require("../connections/pg-connection");
var ApiResponse_1 = require("../utils/ApiResponse");
var ApiError_1 = require("../utils/ApiError");
var redis_connection_1 = require("../connections/redis-connection");
var AptitudeController = /** @class */ (function () {
    function AptitudeController() {
        var _this = this;
        this.createAptitude = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var apti, client, rows, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        apti = req.body;
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 6]);
                        return [4 /*yield*/, client.query("INSERT INTO aptitude_tests (name, test_timestamp, duration, total_questions)\n                VALUES ($1, $2, $3, $4)\n                RETURNING *", [apti.name, apti.test_timestamp, apti.duration, apti.total_questions])];
                    case 3:
                        rows = (_a.sent()).rows;
                        return [2 /*return*/, res.status(201).json(new ApiResponse_1.default('Aptitude test created successfully', 201, rows[0]))];
                    case 4:
                        error_1 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_1.message, 500))];
                    case 5:
                        client.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        this.getAptitude = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var client, rows, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 6]);
                        return [4 /*yield*/, client.query("SELECT id, name, test_timestamp, duration FROM aptitude_tests ORDER BY id DESC;")];
                    case 3:
                        rows = (_a.sent()).rows;
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Aptitude tests fetched successfully', 200, rows))];
                    case 4:
                        error_2 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_2.message, 500))];
                    case 5:
                        client.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        this.deleteAptitude = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var client, rows, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 6]);
                        return [4 /*yield*/, client.query("DELETE FROM aptitude_tests WHERE id = $1", [req.params.id])];
                    case 3:
                        rows = (_a.sent()).rows;
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Aptitude test deleted successfully', 200, rows))];
                    case 4:
                        error_3 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_3.message, 500))];
                    case 5:
                        client.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        this.updateAptitude = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var apti, client, rows, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        apti = req.body;
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 6]);
                        return [4 /*yield*/, client.query("UPDATE aptitude_tests\n                SET name = $1, test_timestamp = $2, duration = $3\n                WHERE id = $4\n                RETURNING *", [apti.name, apti.test_timestamp, apti.duration, req.params.id])];
                    case 3:
                        rows = (_a.sent()).rows;
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Aptitude test updated successfully', 200, rows[0]))];
                    case 4:
                        error_4 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_4.message, 500))];
                    case 5:
                        client.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        this.addQuestionsToAptitude = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var aptitudeId, questionIds, client, aptitudeRows, questionRows, _loop_1, _i, questionIds_1, qid, state_1, query, values, rows, updateQuery, updateValues, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        aptitudeId = req.params.id;
                        questionIds = req.body.questionIds;
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _a.sent();
                        console.log(questionIds);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, 8, 9]);
                        return [4 /*yield*/, client.query("SELECT id FROM aptitude_tests WHERE id = $1", [aptitudeId])];
                    case 3:
                        aptitudeRows = (_a.sent()).rows;
                        if ((aptitudeRows === null || aptitudeRows === void 0 ? void 0 : aptitudeRows.length) === 0) {
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default('Aptitude test not found', 404))];
                        }
                        return [4 /*yield*/, client.query("SELECT question_id FROM aptitude_questions WHERE aptitude_test_id = $1", [aptitudeId])];
                    case 4:
                        questionRows = (_a.sent()).rows;
                        _loop_1 = function (qid) {
                            if (questionRows.find(function (q) { return q.question_id === qid; })) {
                                return { value: res.status(409).json(new ApiError_1.default('Question already exists in aptitude test', 409)) };
                            }
                        };
                        // check if any of the questions already exist in aptitude
                        for (_i = 0, questionIds_1 = questionIds; _i < questionIds_1.length; _i++) {
                            qid = questionIds_1[_i];
                            state_1 = _loop_1(qid);
                            if (typeof state_1 === "object")
                                return [2 /*return*/, state_1.value];
                        }
                        query = "\n                INSERT INTO aptitude_questions (aptitude_test_id, question_id)\n                SELECT $1, unnest($2::int[])\n                ON CONFLICT DO NOTHING\n                RETURNING *;\n            ";
                        values = [aptitudeId, questionIds];
                        return [4 /*yield*/, client.query(query, values)];
                    case 5:
                        rows = (_a.sent()).rows;
                        updateQuery = "\n                UPDATE questions\n                SET last_used = $1\n                WHERE id = ANY($2::int[])   \n                RETURNING *;\n            ";
                        updateValues = [Date.now().toString(), questionIds];
                        console.log(Date.now().toString());
                        return [4 /*yield*/, client.query(updateQuery, updateValues)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Questions added to aptitude test successfully', 200, rows))];
                    case 7:
                        error_5 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_5.message, 500))];
                    case 8:
                        client.release();
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        }); });
        this.getUpcomingAptitudes = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var currentTimestamp, client, rows, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentTimestamp = Date.now().toString();
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        return [4 /*yield*/, client.query("SELECT id, name, test_timestamp, duration \n                 FROM aptitude_tests\n                 WHERE test_timestamp > $1 \n                 ORDER BY test_timestamp ASC", [currentTimestamp])];
                    case 3:
                        rows = (_a.sent()).rows;
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Upcoming aptitude tests fetched successfully', 200, rows))];
                    case 4:
                        error_6 = _a.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, client.release()];
                    case 6:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        this.getAptitudeById = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var aptitudeId, client, questions, rows, r2, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        aptitudeId = req.params.id;
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _a.sent();
                        questions = [];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, 6, 7]);
                        return [4 /*yield*/, client.query("SELECT id, name, test_timestamp, duration \n                 FROM aptitude_tests\n                 WHERE id = $1", [aptitudeId])];
                    case 3:
                        rows = (_a.sent()).rows;
                        return [4 /*yield*/, client.query("SELECT \n                    q.id AS question_id,\n                    q.description,\n                    q.topic_tags,\n                    q.question_type,\n                    q.last_used,\n                    q.difficulty_level,\n                    q.options,\n                    q.correct_option\n                 FROM \n                    questions q\n                 INNER JOIN \n                    aptitude_questions aq ON q.id = aq.question_id\n                 WHERE \n                    aq.aptitude_test_id = $1;", [aptitudeId])];
                    case 4:
                        r2 = _a.sent();
                        questions = r2.rows;
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Aptitude test fetched successfully', 200, { aptitude: rows[0], questions: questions }))];
                    case 5:
                        error_7 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_7.message, 500))];
                    case 6:
                        client.release();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        this.getAptitudeForUser = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var currentTimestamp, userData, aptitudeId, cache, client, r1, apti, rows, validatedQuestions, response, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentTimestamp = Math.floor(Date.now() / 1000).toString();
                        userData = req.body;
                        aptitudeId = req.params.id;
                        if (!userData || !aptitudeId)
                            return [2 /*return*/, res.status(400).json(new ApiError_1.default("Bad request", 400))];
                        return [4 /*yield*/, redis_connection_1.redisClient.get("apti-".concat(aptitudeId, ":").concat(userData.trade))];
                    case 1:
                        cache = _a.sent();
                        if (cache) {
                            return [2 /*return*/, res.status(200).json(new ApiResponse_1.default("Aptitude fetched Successfully", 200, cache))];
                        }
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 2:
                        client = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 7, 8, 9]);
                        return [4 /*yield*/, client.query("SELECT id, name, test_timestamp, duration \n                 FROM aptitude_tests\n                 WHERE id = $1", [aptitudeId])];
                    case 4:
                        r1 = _a.sent();
                        //  check if  aptitude test exists and test_timestamp is greater than current timestamp
                        if (r1.rows.length === 0) {
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default('Aptitude test not found', 404))];
                        }
                        apti = r1.rows[0];
                        // console.log(apti.test_timestamp, currentTimestamp)
                        if (+apti.test_timestamp > +currentTimestamp) {
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default('Aptitude test has not started yet', 401))];
                        }
                        else if (+apti.test_timestamp + +apti.duration * 60 < +currentTimestamp) {
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default('Aptitude test has ended', 401))];
                        }
                        return [4 /*yield*/, client.query("SELECT \n                    q.id AS id,\n                    q.description,\n                    q.topic_tags,\n                    q.question_type,\n                    q.last_used,\n                    q.difficulty_level,\n                    q.format,\n                    q.options,\n                    q.correct_option\n                 FROM \n                    questions q\n                 INNER JOIN \n                    aptitude_questions aq ON q.id = aq.question_id\n                 WHERE \n                    aq.aptitude_test_id = $1 AND (question_type = $2 OR question_type = 'GENERAL')", [aptitudeId, userData.trade])];
                    case 5:
                        rows = (_a.sent()).rows;
                        validatedQuestions = rows.map(function (question) {
                            // Ensure correct_option is always a valid array
                            if (!question.correct_option ||
                                !Array.isArray(question.correct_option) ||
                                question.correct_option.length === 0) {
                                console.warn("Question ".concat(question.id, " has invalid correct_option:"), question.correct_option);
                                question.correct_option = [1]; // Default to first option
                            }
                            // Ensure options is always an array
                            if (!question.options || !Array.isArray(question.options)) {
                                console.warn("Question ".concat(question.id, " has invalid options:"), question.options);
                                question.options = [];
                            }
                            return question;
                        });
                        response = {
                            aptitude: apti,
                            questions: validatedQuestions
                        };
                        return [4 /*yield*/, redis_connection_1.redisClient.set("apti-".concat(aptitudeId, ":").concat(userData.trade), JSON.stringify(response), { EX: 600 })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Aptitude test questions fetched successfully', 200, response))];
                    case 7:
                        error_8 = _a.sent();
                        console.log(error_8);
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_8.message, 500))];
                    case 8:
                        client.release();
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        }); });
        this.deleteQuestionFromAptitude = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, aptitudeId, questionId, client, rows, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.body, aptitudeId = _a.aptitudeId, questionId = _a.questionId;
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, 5, 6]);
                        return [4 /*yield*/, client.query("DELETE FROM aptitude_questions WHERE aptitude_test_id = $1 AND question_id = $2", [aptitudeId, questionId])];
                    case 3:
                        rows = (_b.sent()).rows;
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Question deleted from aptitude test successfully', 200, rows))];
                    case 4:
                        error_9 = _b.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_9.message, 500))];
                    case 5:
                        client.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        this.submitAptitude = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var aptitudeId, userData, answers, client, currentTimestamp, r1, apti, userRows, appearedRows, questionRows, score, _loop_2, _i, answers_1, answer, submissionRows, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        aptitudeId = req.params.id;
                        userData = req.body.userData;
                        answers = req.body.answers;
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 12, 13, 14]);
                        currentTimestamp = Math.floor(Date.now() / 1000);
                        return [4 /*yield*/, client.query("SELECT id, name, test_timestamp, duration \n                 FROM aptitude_tests\n                 WHERE id = $1", [aptitudeId])];
                    case 3:
                        r1 = _a.sent();
                        //  check if  aptitude test exists and test_timestamp is greater than current timestamp
                        if (r1.rows.length === 0) {
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default('Aptitude test not found', 404))];
                        }
                        apti = r1.rows[0];
                        if (+apti.test_timestamp > +currentTimestamp) {
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default('Aptitude test has not started yet', 401))];
                        }
                        else if (+apti.test_timestamp + +apti.duration * 60 < +currentTimestamp) {
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default('Aptitude test has ended', 401))];
                        }
                        return [4 /*yield*/, client.query("SELECT regno, blocked FROM users WHERE regno = $1", [userData.regno])];
                    case 4:
                        userRows = (_a.sent()).rows;
                        if ((userRows === null || userRows === void 0 ? void 0 : userRows.length) === 0) {
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default('User has not registered', 404))];
                        }
                        if (userRows[0].blocked) {
                            return [2 /*return*/, res.status(403).json(new ApiError_1.default('Your quiz is blocked, Contact Admin', 403))];
                        }
                        return [4 /*yield*/, client.query("SELECT * FROM user_responses WHERE aptitude_test_id = $1 AND regno = $2", [aptitudeId, userData.regno])];
                    case 5:
                        appearedRows = (_a.sent()).rows;
                        if ((appearedRows === null || appearedRows === void 0 ? void 0 : appearedRows.length) > 0) {
                            return [2 /*return*/, res.status(409).json(new ApiError_1.default('You have already appeared for the test', 409))];
                        }
                        return [4 /*yield*/, client.query("SELECT q.id FROM questions q\n                 INNER JOIN aptitude_questions aq ON q.id = aq.question_id\n                 WHERE aq.aptitude_test_id = $1", [aptitudeId])];
                    case 6:
                        questionRows = (_a.sent()).rows;
                        score = 0;
                        _loop_2 = function (answer) {
                            var questionRows_1, hasCorrectAnswer;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, client.query("SELECT correct_option FROM questions WHERE id = $1", [answer.question_id])];
                                    case 1:
                                        questionRows_1 = (_b.sent()).rows;
                                        hasCorrectAnswer = answer.selected_options.some(function (selectedOption) {
                                            return questionRows_1[0].correct_option.includes(selectedOption);
                                        });
                                        if (hasCorrectAnswer) {
                                            score++;
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, answers_1 = answers;
                        _a.label = 7;
                    case 7:
                        if (!(_i < answers_1.length)) return [3 /*break*/, 10];
                        answer = answers_1[_i];
                        return [5 /*yield**/, _loop_2(answer)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 7];
                    case 10: return [4 /*yield*/, client.query("INSERT INTO user_responses (regno ,aptitude_test_id, answers, response_time, marks)\n                 VALUES ($1, $2, $3, $4, $5)\n                 RETURNING *", [userData.regno, aptitudeId, JSON.stringify(answers), currentTimestamp, score])];
                    case 11:
                        submissionRows = (_a.sent()).rows;
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Aptitude test submitted successfully', 200, submissionRows[0]))];
                    case 12:
                        error_10 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_10.message, 500))];
                    case 13:
                        client.release();
                        return [7 /*endfinally*/];
                    case 14: return [2 /*return*/];
                }
            });
        }); });
        this.getAptitudeResponses = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, page, items, responseQuery, countQuery, countResult, totalResponses, totalPages, responseResult, data, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = req.params.id;
                        page = req.query.page ? parseInt(req.query.page, 10) : 1;
                        items = req.query.items ? parseInt(req.query.items, 10) : 20;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        responseQuery = "\n                WITH ranked_responses AS (\n                    SELECT \n                        ur.id,\n                        u.regno, \n                        u.name, \n                        u.trade,\n                        ur.marks,\n                        ur.response_time,\n                        RANK() OVER (\n                            PARTITION BY ur.aptitude_test_id\n                            ORDER BY ur.marks DESC, ur.response_time ASC\n                        ) AS rank\n                    FROM \n                        user_responses ur\n                    INNER JOIN \n                        users u ON ur.regno = u.regno\n                    WHERE \n                        ur.aptitude_test_id = $1\n                )\n                SELECT * \n                FROM ranked_responses\n                ORDER BY rank ASC\n                LIMIT $2 OFFSET $3;\n            ";
                        countQuery = "\n                SELECT \n                    COUNT(*) AS total\n                FROM \n                    user_responses \n                WHERE \n                    aptitude_test_id = $1;\n            ";
                        return [4 /*yield*/, pg_connection_1.dbPool.query(countQuery, [id])];
                    case 2:
                        countResult = _a.sent();
                        totalResponses = parseInt(countResult.rows[0].total, 10);
                        totalPages = Math.ceil(totalResponses / items);
                        return [4 /*yield*/, pg_connection_1.dbPool.query(responseQuery, [
                                id,
                                items,
                                items * (page - 1),
                            ])];
                    case 3:
                        responseResult = _a.sent();
                        data = {
                            currentPage: page,
                            totalPages: totalPages,
                            totalResponses: totalResponses,
                            responses: responseResult.rows, // Includes rank in the result
                        };
                        return [2 /*return*/, res
                                .status(200)
                                .json(new ApiResponse_1.default('Aptitude test responses fetched successfully', 200, data))];
                    case 4:
                        error_11 = _a.sent();
                        return [2 /*return*/, res
                                .status(500)
                                .json(new ApiError_1.default(error_11.message, 500))];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        this.getUserApitudeResponse = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var aptiId, regno, ansQuery, rows, answers, userMarks_1, questionQuery, questionRows_2, rankQuery, rankResult, _a, rank, total_users, response, data, error_12;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        aptiId = req.params.id;
                        regno = (_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.regno;
                        if (req.user.role != "admin" && regno && req.user.regno != regno)
                            return [2 /*return*/, res.status(401).json(new ApiError_1.default("Award for most oversmartness goes to you", 401))];
                        if (!regno)
                            regno = req.user.regno;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        ansQuery = "\n                SELECT answers, marks\n                FROM user_responses\n                WHERE aptitude_test_id = $1 AND regno = $2;\n            ";
                        return [4 /*yield*/, pg_connection_1.dbPool.query(ansQuery, [aptiId, regno])];
                    case 2:
                        rows = (_c.sent()).rows;
                        if (rows.length === 0) {
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default("You didn't appear for this test.", 404))];
                        }
                        answers = JSON.parse(rows[0].answers);
                        userMarks_1 = 0;
                        questionQuery = "\n                SELECT q.id, q.description, q.options, q.correct_option, format, question_type\n                FROM questions q\n                INNER JOIN aptitude_questions aq ON q.id = aq.question_id\n                WHERE aq.aptitude_test_id = $1;\n            ";
                        return [4 /*yield*/, pg_connection_1.dbPool.query(questionQuery, [aptiId])];
                    case 3:
                        questionRows_2 = _c.sent();
                        rankQuery = "\n                WITH ranked_responses AS (\n                    SELECT \n                        regno,\n                        RANK() OVER (\n                            PARTITION BY aptitude_test_id\n                            ORDER BY marks DESC, response_time ASC\n                        ) AS rank\n                    FROM \n                        user_responses\n                    WHERE aptitude_test_id = $1\n                )\n                SELECT \n                    (SELECT COUNT(*) FROM user_responses WHERE aptitude_test_id = $1) AS total_users,\n                    rank\n                FROM ranked_responses\n                WHERE regno = $2;\n            ";
                        return [4 /*yield*/, pg_connection_1.dbPool.query(rankQuery, [aptiId, regno])];
                    case 4:
                        rankResult = _c.sent();
                        if (rankResult.rows.length === 0) {
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default("Unable to calculate rank for the given user.", 404))];
                        }
                        _a = rankResult.rows[0], rank = _a.rank, total_users = _a.total_users;
                        response = answers.map(function (ans) {
                            // Check if any of the selected options match any of the correct options
                            var question = questionRows_2.rows.find(function (q) { return q.id === ans.question_id; });
                            var hasCorrectAnswer = ans.selected_options.some(function (selectedOption) {
                                return question.correct_option.includes(selectedOption);
                            });
                            userMarks_1 += hasCorrectAnswer ? 1 : 0;
                            return {
                                question: question,
                                answers: ans.selected_options, // Return all selected options
                            };
                        });
                        data = {
                            rank: rank,
                            total_users: total_users,
                            marks: userMarks_1,
                            responses: response,
                        };
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default("Aptitude response fetched successfully", 200, data))];
                    case 5:
                        error_12 = _c.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_12.message, 500))];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        this.getAptitudeToppers = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var aptiId, cache, client, overallToppersQuery, overallToppers, tradeToppersQuery, tradeToppers, response, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        aptiId = req.params.id;
                        if (!aptiId)
                            return [2 /*return*/, res.status(400).json(new ApiError_1.default("Bad request", 400))];
                        return [4 /*yield*/, redis_connection_1.redisClient.get("toppers:".concat(aptiId))];
                    case 1:
                        cache = _a.sent();
                        if (cache) {
                            return [2 /*return*/, res.status(200).json(new ApiResponse_1.default("Toppers fetched Successfully", 200, JSON.parse(cache)))];
                        }
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 2:
                        client = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 7, 8, 9]);
                        return [4 /*yield*/, client.query("WITH RankedToppers AS (\n                    SELECT \n                        u.regno, \n                        u.name, \n                        u.avatar,\n                        u.trade,\n                        ur.marks,\n                        ur.response_time,\n                        RANK() OVER (ORDER BY ur.marks DESC, ur.response_time ASC) AS rank\n                    FROM \n                        user_responses ur\n                    INNER JOIN \n                        users u ON ur.regno = u.regno\n                    WHERE \n                        ur.aptitude_test_id = $1\n                )\n                SELECT * FROM RankedToppers\n                WHERE rank <= 3;", [aptiId])];
                    case 4:
                        overallToppersQuery = _a.sent();
                        overallToppers = overallToppersQuery.rows;
                        return [4 /*yield*/, client.query("WITH TradeRankedToppers AS (\n                    SELECT \n                        u.regno, \n                        u.name, \n                        u.avatar,   \n                        u.trade,\n                        ur.marks,\n                        ur.response_time,\n                        RANK() OVER (PARTITION BY u.trade ORDER BY ur.marks DESC, ur.response_time ASC) AS rank\n                    FROM \n                        user_responses ur\n                    INNER JOIN \n                        users u ON ur.regno = u.regno\n                    WHERE \n                        ur.aptitude_test_id = $1\n                )\n                SELECT * FROM TradeRankedToppers\n                WHERE rank <= 3;", [aptiId])];
                    case 5:
                        tradeToppersQuery = _a.sent();
                        tradeToppers = tradeToppersQuery.rows;
                        response = {
                            overall: overallToppers,
                            trade: tradeToppers,
                        };
                        return [4 /*yield*/, redis_connection_1.redisClient.set("toppers:".concat(aptiId), JSON.stringify(response), { EX: 600 })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Toppers fetched successfully', 200, response))];
                    case 7:
                        error_13 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_13.message, 500))];
                    case 8:
                        client.release();
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        }); });
        this.getPastAptitudes = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var currentTimestamp, client, rows, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentTimestamp = Math.floor(Date.now() / 1000).toString();
                        return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 1:
                        client = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 6]);
                        return [4 /*yield*/, client.query("SELECT id, name, test_timestamp, duration \n                 FROM aptitude_tests\n                 WHERE test_timestamp < $1 \n                 ORDER BY test_timestamp DESC", [currentTimestamp])];
                    case 3:
                        rows = (_a.sent()).rows;
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Past aptitude tests fetched successfully', 200, rows))];
                    case 4:
                        error_14 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_14.message, 500))];
                    case 5:
                        client.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
    }
    return AptitudeController;
}());
exports.default = new AptitudeController();
