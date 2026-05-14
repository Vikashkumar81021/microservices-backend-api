import cors from "cors";
import { config } from "../config/index.js";

const corsMiddleware = cors({
  origin: process.env.ALLOWED_OROGINS,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
});

export { corsMiddleware };
