"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ApiResponse = /** @class */ (function () {
    function ApiResponse(message, status, data) {
        this.message = message;
        this.status = status;
        this.data = data;
        this.success = true;
        this.message = message;
        this.status = status;
        this.success = true;
    }
    return ApiResponse;
}());
exports.default = ApiResponse;
