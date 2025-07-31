"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
var nodemailer_1 = require("nodemailer");
var transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});
var sendMail = function (to, subject, html) {
    console.log("Sending email to: ", to);
    var mailOptions = {
        from: "info@slietshare.online",
        to: to,
        subject: subject,
        html: html,
    };
    return new Promise(function (resolve, reject) {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.dir(error);
                resolve(false);
            }
            else {
                console.log("Email sent: " + info.response);
                resolve(true);
            }
        });
    });
};
exports.sendMail = sendMail;
