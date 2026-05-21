import { config } from "../config/index.js";

import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/error.js";
import { logger } from "../config/logger.js";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      throw new UnauthorizedError("Unauthorized");
    }

    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET_KEY);

    req.user = decoded;
    //ADD USER ID ON HEADERS
    req.headers["x-user-id"] = decoded.id.toString();
    logger.info(`Userid ${decoded.id} is authentication successfully`);
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
