// redisClient.js
import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisClient = createClient({
  username: 'default',
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  password: process.env.REDIS_PASSWORD
});

redisClient.on("error", (err) => console.error("Redis error:", err));
redisClient.on("connect", () => console.log("✅ Connected to Redis Cloud"));

await redisClient.connect();

const keys = await redisClient.keys('*some-pattern*');
for (const key of keys) {
  const val = await redisClient.get(key);
  console.log(`${key}: ${val}`);
}

export default redisClient;
