import { configDotenv } from "dotenv";
import Redis from "ioredis";

configDotenv()

export const redis = new Redis(process.env.REDIS_URL)