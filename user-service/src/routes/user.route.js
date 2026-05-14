import express from "express";
import authMiddleware from "../middlewares/auth.middlewarer.js";
import { getProfileController } from "../controller/user.controller.js";
const router = express.Router();

router.get("/profile", authMiddleware, getProfileController);

export default router;
