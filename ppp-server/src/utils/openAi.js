"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var openai_1 = require("openai");
var API_KEY = process.env.OPENAI_API_KEY || '';
var openai = new openai_1.default({
    apiKey: API_KEY,
    maxRetries: 2,
});
exports.default = openai;
