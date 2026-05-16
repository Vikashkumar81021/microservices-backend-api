import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  ipRateLimit,
  combinedRateLimit,
  endpointRateLimit,
} from "../middlewares/rateLimiting.middleware.js";
import { config } from "../config/index.js";

const router = express.Router();

const userServiceProxy = createProxy(
  "userService",
  config.SERVICES.USER_SERVICE_URL,
);
router.post("/user/auth/login", endpointRateLimit(10, 9000), userServiceProxy); //10 request 15 minute
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
