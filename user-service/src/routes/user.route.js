import express from "express";
import { getProfileController } from "../controller/user.controller.js";
import { getUserContext } from "../middlewares/getUserContext.js";
const router = express.Router();

router.get("/profile", getUserContext, getProfileController);

export default router;
