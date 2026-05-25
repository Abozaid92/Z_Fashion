// lib/notificationQueue.ts (في مشروع Next.js)
import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const notificationQueue = new Queue("push-notifications", {
  connection,
});
