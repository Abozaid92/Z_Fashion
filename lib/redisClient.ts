import { createClient, RedisClientType } from "redis";

const globalForRedis = global as unknown as { redis: RedisClientType };

let redisClient: RedisClientType;

if (!globalForRedis.redis) {
  // 1. إنشاء الاتصال لأول مرة فقط
  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        return Math.min(retries * 50, 3000);
      },
    },
  });

  // 2. ربط الـ Listeners
  redisClient.on("error", (err) =>
    console.error("❌ Redis Client Error:", err),
  );
  redisClient.on("connect", () => console.log("✅ Redis Client Connected"));

  // 3. فتح الاتصال (التعديل السحري هنا) 👇
  // اتصل فقط لو إحنا مش في مرحلة الـ Build
  if (process.env.NEXT_PHASE !== "phase-production-build") {
    redisClient.connect();
  }

  // 4. حفظه في الـ Global
  if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = redisClient;
  }
} else {
  // إذا كان موجود مسبقاً، استخدمه هو هو
  redisClient = globalForRedis.redis;
}

export default redisClient;
