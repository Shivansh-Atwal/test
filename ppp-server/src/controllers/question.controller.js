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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var asyncHandler_1 = require("../utils/asyncHandler");
var ApiError_1 = require("../utils/ApiError");
var ApiResponse_1 = require("../utils/ApiResponse");
var pg_connection_1 = require("../connections/pg-connection");
var uploadOnCloud_1 = require("../utils/uploadOnCloud");
var openAi_1 = require("../utils/openAi");
var QuestionController = /** @class */ (function () {
    function QuestionController() {
        var _this = this;
        this.addQuestion = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var question, parsed, correctOptionString, img, imgPath, client, rows, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        question = req.body;
                        if (!question.options || !question.correct_option || !question.difficulty_level || !question.question_type || !question.format || !question.topic_tags) {
                            return [2 /*return*/, res.status(400).json(new ApiError_1.default('All fields are required', 400))];
                        }
                        question.options = question.options.split('/|/');
                        question.topic_tags = question.topic_tags.split(',');
                        // Handle correct_option as array
                        if (typeof question.correct_option === 'string') {
                            console.log('Received correct_option as string:', question.correct_option);
                            try {
                                parsed = JSON.parse(question.correct_option);
                                question.correct_option = Array.isArray(parsed) ? parsed : [parsed];
                                console.log('Parsed as JSON:', question.correct_option);
                            }
                            catch (_c) {
                                correctOptionString = question.correct_option;
                                question.correct_option = correctOptionString.split('/|/').map(Number);
                                console.log('Parsed with separator:', question.correct_option);
                            }
                        }
                        else if (!Array.isArray(question.correct_option)) {
                            question.correct_option = [question.correct_option];
                            console.log('Converted to array:', question.correct_option);
                        }
                        else {
                            console.log('Already an array:', question.correct_option);
                        }
                        if (!(question.format === 'img')) return [3 /*break*/, 2];
                        img = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
                        if (!img) {
                            return [2 /*return*/, res.status(400).json(new ApiError_1.default('Image is required', 400))];
                        }
                        return [4 /*yield*/, uploadOnCloud_1.default.upload(img, "questions")];
                    case 1:
                        imgPath = _b.sent();
                        question.description = imgPath;
                        _b.label = 2;
                    case 2: return [4 /*yield*/, pg_connection_1.dbPool.connect()];
                    case 3:
                        client = _b.sent();
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, 7, 8]);
                        return [4 /*yield*/, client.query("INSERT INTO questions (description, options, correct_option, difficulty_level, question_type, format, topic_tags)\n                VALUES ($1, $2, $3, $4, $5, $6, $7)\n                RETURNING *", [question.description, question.options, question.correct_option, question.difficulty_level, question.question_type, question.format, question.topic_tags])];
                    case 5:
                        rows = (_b.sent()).rows;
                        return [2 /*return*/, res.status(201).json(new ApiResponse_1.default('Question added successfully', 201, rows[0]))];
                    case 6:
                        error_1 = _b.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_1.message, 500))];
                    case 7:
                        client.release();
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
        this.deleteQuestion = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, rows, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = +req.params.id;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, pg_connection_1.dbPool.query("DELETE FROM questions WHERE id=$1 RETURNING *", [id])];
                    case 2:
                        rows = (_a.sent()).rows;
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default("Question deleted successfully", 200, rows[0]))];
                    case 3:
                        e_1 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(e_1.message, 500))];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        this.getQuestions = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var filters, page, limit, offset, query, countQuery, values, index, rows, countRows, total, totalPages, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filters = req.body;
                        page = parseInt(req.query.page, 10) || 1;
                        limit = parseInt(req.query.limit, 10) || 10;
                        offset = (page - 1) * limit;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        query = "SELECT * FROM questions WHERE 1=1";
                        countQuery = "SELECT COUNT(*) AS total FROM questions WHERE 1=1";
                        values = [];
                        index = 1;
                        // Add filters dynamically
                        if (filters.topic_tags && filters.topic_tags.length > 0) {
                            query += " AND topic_tags @> $".concat(index);
                            countQuery += " AND topic_tags @> $".concat(index);
                            values.push(filters.topic_tags);
                            index++;
                        }
                        if (filters.question_type) {
                            query += " AND question_type = $".concat(index);
                            countQuery += " AND question_type = $".concat(index);
                            values.push(filters.question_type);
                            index++;
                        }
                        if (filters.difficulty_level) {
                            query += " AND difficulty_level = $".concat(index);
                            countQuery += " AND difficulty_level = $".concat(index);
                            values.push(filters.difficulty_level);
                            index++;
                        }
                        // Add sorting and pagination
                        query += " ORDER BY id ".concat(filters.sort || 'ASC', " LIMIT $").concat(index, " OFFSET $").concat(index + 1);
                        values.push(limit, offset);
                        return [4 /*yield*/, pg_connection_1.dbPool.query(query, values)];
                    case 2:
                        rows = (_a.sent()).rows;
                        return [4 /*yield*/, pg_connection_1.dbPool.query(countQuery, values.slice(0, index - 1))];
                    case 3:
                        countRows = (_a.sent()).rows;
                        total = parseInt(countRows[0].total, 10);
                        totalPages = Math.ceil(total / limit);
                        // Prepare response
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Questions retrieved successfully', 200, {
                                page: page,
                                totalPages: totalPages,
                                total: total,
                                results: rows,
                            }))];
                    case 4:
                        error_2 = _a.sent();
                        console.error('Error fetching questions:', error_2);
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_2.message, 500))];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        this.explainUsingAi = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var questionId, rows, question, query, stream, _a, stream_1, stream_1_1, chunk, content, e_2_1, streamError_1, error_3;
            var _b, e_2, _c, _d;
            var _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        questionId = +req.params.id;
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 20, , 21]);
                        // Validate questionId
                        if (!questionId || isNaN(questionId)) {
                            return [2 /*return*/, res.status(400).json(new ApiError_1.default('Invalid question ID', 400))];
                        }
                        return [4 /*yield*/, pg_connection_1.dbPool.query("SELECT * FROM questions WHERE id=$1", [questionId])];
                    case 2:
                        rows = (_g.sent()).rows;
                        question = rows[0];
                        if (!question || question.format !== 'text') {
                            return [2 /*return*/, res.status(404).json(new ApiError_1.default('Question not found', 404))];
                        }
                        query = "\n            Please explain the following question and answer:\n            Question: ".concat(question.description, "\n            Options: ").concat(question.options, "\n            Correct Options: ").concat(Array.isArray(question.correct_option) ? question.correct_option.join(', ') : question.correct_option, "\n            ");
                        return [4 /*yield*/, openAi_1.default.chat.completions.create({
                                model: 'gpt-3.5-turbo',
                                messages: [
                                    {
                                        role: 'system',
                                        content: 'You are a helpful assistant that explains questions and their answers clearly.'
                                    },
                                    {
                                        role: 'user',
                                        content: query
                                    }
                                ],
                                stream: true
                            })];
                    case 3:
                        stream = _g.sent();
                        // Set up SSE headers
                        res.writeHead(200, {
                            'Content-Type': 'text/event-stream',
                            'Cache-Control': 'no-cache',
                            'Connection': 'keep-alive',
                            'X-Accel-Buffering': 'no' // Disable buffering for nginx
                        });
                        _g.label = 4;
                    case 4:
                        _g.trys.push([4, 17, 18, 19]);
                        _g.label = 5;
                    case 5:
                        _g.trys.push([5, 10, 11, 16]);
                        _a = true, stream_1 = __asyncValues(stream);
                        _g.label = 6;
                    case 6: return [4 /*yield*/, stream_1.next()];
                    case 7:
                        if (!(stream_1_1 = _g.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 9];
                        _d = stream_1_1.value;
                        _a = false;
                        chunk = _d;
                        content = ((_f = (_e = chunk.choices[0]) === null || _e === void 0 ? void 0 : _e.delta) === null || _f === void 0 ? void 0 : _f.content) || '';
                        if (content) {
                            res.write("data: ".concat(JSON.stringify({ content: content }), "\n\n"));
                        }
                        _g.label = 8;
                    case 8:
                        _a = true;
                        return [3 /*break*/, 6];
                    case 9: return [3 /*break*/, 16];
                    case 10:
                        e_2_1 = _g.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 16];
                    case 11:
                        _g.trys.push([11, , 14, 15]);
                        if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 13];
                        return [4 /*yield*/, _c.call(stream_1)];
                    case 12:
                        _g.sent();
                        _g.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        if (e_2) throw e_2.error;
                        return [7 /*endfinally*/];
                    case 15: return [7 /*endfinally*/];
                    case 16: return [3 /*break*/, 19];
                    case 17:
                        streamError_1 = _g.sent();
                        // Handle stream errors
                        console.error('Stream error:', streamError_1);
                        res.write("data: ".concat(JSON.stringify({ error: 'Stream interrupted' }), "\n\n"));
                        return [3 /*break*/, 19];
                    case 18:
                        res.end();
                        return [7 /*endfinally*/];
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        error_3 = _g.sent();
                        // If headers haven't been sent yet, send error response
                        if (!res.headersSent) {
                            return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_3 instanceof Error ? error_3.message : 'Internal server error', 500))];
                        }
                        // If headers have been sent, end the stream with error
                        res.write("data: ".concat(JSON.stringify({ error: 'An error occurred' }), "\n\n"));
                        res.end();
                        return [3 /*break*/, 21];
                    case 21: return [2 /*return*/];
                }
            });
        }); });
        this.getQuestionTopics = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var type, rows, topics, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        type = req.query.type || '';
                        if (!type)
                            return [2 /*return*/, res.status(400).json(new ApiError_1.default('Question type is required', 400))];
                        type = String(type).toUpperCase();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, pg_connection_1.dbPool.query("SELECT DISTINCT topic_tags FROM questions WHERE question_type=$1", [type])];
                    case 2:
                        rows = (_a.sent()).rows;
                        topics = rows.map(function (row) { return row.topic_tags; }).flat();
                        return [2 /*return*/, res.status(200).json(new ApiResponse_1.default('Question topics retrieved successfully', 200, topics))];
                    case 3:
                        error_4 = _a.sent();
                        return [2 /*return*/, res.status(500).json(new ApiError_1.default(error_4.message, 500))];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    }
    return QuestionController;
}());
exports.default = new QuestionController();
