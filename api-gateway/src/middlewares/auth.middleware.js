import { config } from "../config/index.js";

import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/error.js";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      throw new UnauthorizedError("Unauthorized");
    }

    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET_KEY);

    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
