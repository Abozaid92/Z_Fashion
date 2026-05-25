import { createClient, RedisClientType } from "redis";

const globalForRedis = global as unknown as { redis: RedisClientType };

let baseClient: RedisClientType;

if (!globalForRedis.redis) {
  baseClient = createClient({
    url: process.env.REDIS_URL,
    socket: { reconnectStrategy: (retries) => Math.min(retries * 50, 3000) },
  });

  if (process.env.NEXT_PHASE !== "phase-production-build") {
    baseClient.connect().catch(console.error);
  }

  if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = baseClient;
  }
} else {
  baseClient = globalForRedis.redis;
}

// 🚀 الحماية المطلقة: أي طلب بييجي وقت الـ Build، نرجعه "فاضي" فوراً من غير ما يوصل للسيرفر
const redisClient = new Proxy(baseClient, {
  get(target, prop) {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      // لو حد بيسأل الـ client مفتوح ولا لأ، قوله لأ
      if (prop === "isOpen") return false;
      // أي دالة (get, incr, hIncrBy) نرجع دالة وهمية بترجع null عشان الـ Build ما يقفش
      return () => Promise.resolve(null);
    }
    const value = Reflect.get(target, prop);
    return typeof value === "function" ? value.bind(target) : value;
  },
}) as RedisClientType;

export default redisClient;
