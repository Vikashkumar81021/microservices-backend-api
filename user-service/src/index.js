import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authroutes from "./routes/auth.route.js";
import userroutes from "./routes/user.route.js";
import "./jobs/index.js";
import { config } from "./config/index.js";
import { logger } from "./config/logger.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { corsMiddleware } from "./middlewares/cors.middleware.js";

const port = 3001;
const app = express();
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(corsMiddleware);

app.use("/auth", authroutes);
app.use("/api", userroutes);
app.use(errorMiddleware);
const startServer = async () => {
  try {
    const server = app.listen(config.PORT, () => {
      logger.info(
        `${config.SERVICE_NAME} is running on http://localhost:${config.PORT}`,
      );
    });
    server.on("error", (error) => {
      logger.error("Server error:", error);
      process.exit(1);
    });
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT received. Shutting down gracefully...");
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};
startServer();
