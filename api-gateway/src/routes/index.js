import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  ipRateLimit,
  combinedRateLimit,
  endpointRateLimit,
} from "../middlewares/rateLimiting.middleware.js";
import { config } from "../config/index.js";
import { createProxy } from "../service/proxy.js";

const router = express.Router();

const userServiceProxy = createProxy(
  "userService",
  config.SERVICES.USER_SERVICE_URL,
);
console.log("router", router.route);

router.post("/user/auth/login", endpointRateLimit(20, 9000), userServiceProxy); //10 request 15 minute

router.get(
  "/users/user/profile",
  authMiddleware,
  combinedRateLimit(),
  userServiceProxy,
);

router.get("/gateway/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Health Check",
    timeStamp: new Date().toString(),
  });
});

export default router;
