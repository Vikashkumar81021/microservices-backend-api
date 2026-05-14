import { config } from "../config/index.js";
import { UnAuthorizedError } from "../utils/error.js";
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      throw new UnAuthorizedError("Unauthorized");
    }

    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET_KEY);

    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
