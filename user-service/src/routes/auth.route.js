import express from "express";
import {
  login,
  otp,
  rotateToken,
  verifyOtp,
} from "../controller/auth.controller.js";

import { getUserContext } from "../middlewares/getUserContext.js";

const router = express.Router();

router.post("/send-otp", otp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.get("/refresh", getUserContext, rotateToken);

export default router;
