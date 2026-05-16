// import Redis from "ioredis";
// import { config } from "./index.js";
// import { logger } from "./logger.js";

// class RedisClient {
//   static instance = null;
//   static isConnected = false;

//   static getInstance() {
//     if (!RedisClient.instance) {
//       RedisClient.instance = new Redis(config.REDIS_URL, {
//         retryStrategy: (times) => {
//           const delay = Math.min(times * 50, 2000);
//           return delay;
//         },
//         maxRetriesPerRequest: 3,
//       });

//       RedisClient.setupEventListeners();
//     }

//     return RedisClient.instance;
//   }

//   static setupEventListeners() {
//     RedisClient.instance.on("connect", () => {
//       RedisClient.isConnected = true;
//       logger.info("✅ Redis connected");
//     });

//     RedisClient.instance.on("error", (err) => {
//       RedisClient.isConnected = false;
//       logger.error("❌ Redis Error:", err);
//     });

//     RedisClient.instance.on("close", () => {
//       RedisClient.isConnected = false;
//       logger.warn("⚠️ Redis connection closed");
//     });

//     RedisClient.instance.on("reconnecting", () => {
//       logger.info("🔄 Redis reconnecting...");
//     });
//   }
// }

// export default RedisClient;

import { createClient } from "redis";
import { config } from "./index.js";

const RedisClient = createClient({
  url: "redis://:irctpass@localhost:6379",
});

RedisClient.on("connect", () => {
  console.log("✅ Redis connecting...");
});

RedisClient.on("ready", () => {
  console.log("🔥 Redis connected");
});

RedisClient.on("error", (err) => {
  console.log("❌ Redis error:", err);
});

await RedisClient.connect();

export default RedisClient;
