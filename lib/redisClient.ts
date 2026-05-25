import { createClient, RedisClientType } from "redis";

// تعريف الـ Global عشان نمنع تكرار الـ Connections في الـ Development (Next.js Hot Reload)
const globalForRedis = global as unknown as { redis: RedisClientType };

const redisClient =
  globalForRedis.redis ||
  createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        return Math.min(retries * 50, 3000);
      },
    },
  });

// في بيئة التطوير، بنخزن الـ Client في الـ Global object
if (process.env.NODE_ENV !== "production") globalForRedis.redis = redisClient;

// التعامل مع الأخطاء عشان السيرفر ميقعش
redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));
redisClient.on("connect", () => console.log("✅ Redis Client Connected"));

// فتح الاتصال آلياً
if (!redisClient.isOpen) {
  redisClient.connect();
}

export default redisClient;
