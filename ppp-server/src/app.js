"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var http_1 = require("http");
var redis_connection_1 = require("./connections/redis-connection");
var cors_1 = require("cors");
// Import routes
var user_routes_1 = require("./routes/user.routes");
var aptitude_routes_1 = require("./routes/aptitude.routes");
var question_routes_1 = require("./routes/question.routes");
var screenshot_routes_1 = require("./routes/screenshot.routes");
var App = /** @class */ (function () {
    function App() {
        this.env = process.env.ENV || 'DEV';
        this.app = (0, express_1.default)();
        this.server = (0, http_1.createServer)(this.app);
        this.app.use(express_1.default.static('public'));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        if (this.env === 'DEV')
            this.app.use((0, cors_1.default)({
                origin: "http://localhost:5173",
                credentials: true
            }));
        this.app.get('/', function (req, res) {
            res.send('Hello World');
        });
        redis_connection_1.redisClient.on("error", function (err) { return console.log("Redis Client Error", err); });
        redis_connection_1.redisClient.connect().then(function () { return console.log("Connected to redis"); });
        redis_connection_1.redisClient.on("ready", function () {
            console.log("Redis client ready");
        });
    }
    App.prototype.listen = function () {
        this.server.listen(3000, function () {
            console.log('Server is running on port 3000');
        });
    };
    App.prototype.initializeRoutes = function () {
        // Add your routes here
        this.app.use('/user', user_routes_1.default);
        this.app.use('/aptitude', aptitude_routes_1.default);
        this.app.use('/question', question_routes_1.default);
        this.app.use('/screenshot', screenshot_routes_1.default);
    };
    return App;
}());
exports.default = new App();
