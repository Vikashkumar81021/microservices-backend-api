import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

const verfiyAccessToken = (accessToken) => {
  return jwt.verify(accessToken, config.JWT_ACCESS_SECRET_KEY);
};
const verfiyRefreshToken = (refreshToken) => {
  return jwt.verify(refreshToken, config.JWT_REFRESH_TOKEN);
};

export { verfiyAccessToken, verfiyRefreshToken };
