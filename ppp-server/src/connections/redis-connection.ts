import { createClient } from "redis";

const REDIS_USERNAME = process.env.REDIS_USERNAME;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_DB_NUMBER = process.env.REDIS_DB_NUMBER;

const uri = `redis://default:AzT3ZbcUcs9EsrWvjjkU3Cvz9eI7MPMN@redis-12858.c99.us-east-1-4.ec2.redns.redis-cloud.com:12858#13444576`;

// REDIS CONNECTION
const redisClient = createClient({
    url: uri,
});
const verifyOTP = async (otp: string, email: string) => {
    const storedOTP = await redisClient.get(`otp:${email}`);
    if (!storedOTP) return false;
    if (otp.toString() != storedOTP) return false;
    return true;
}


export { redisClient, verifyOTP };
