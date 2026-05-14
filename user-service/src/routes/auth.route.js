import express from "express";
import {
  login,
  otp,
  rotateToken,
  verifyOtp,
} from "../controller/auth.controller.js";
import authMiddleware from "../middlewares/auth.middlewarer.js";

const router = express.Router();

router.post("/send-otp", otp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.get("/refresh", authMiddleware, rotateToken);

export default router;
