"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pg_connection_1 = require("./connections/pg-connection");
var app_1 = require("./app");
(0, pg_connection_1.testConnection)();
app_1.default.listen();
app_1.default.initializeRoutes();
