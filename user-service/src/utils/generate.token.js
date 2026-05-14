import jwt from "jsonwebtoken";
import { config } from ".././config/index.js";

const generateAccessToken = (userId) => {
  const payload = {
    id: userId,
  };
  return jwt.sign(payload, config.JWT_ACCESS_SECRET_KEY, {
    expiresIn: config.JWT_ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (userId) => {
  //jti-JWT IDYe JWT token ka:unique identifier hota hai. hm token track kr paae toh use krte jti
  const payload = {
    id: userId,
    jti: crypto.randomUUID(),
  };
  return jwt.sign(payload, config.JWT_REFRESH_TOKEN, {
    expiresIn: config.JWT_REFRESH_TOKEN_EXPIRY,
  });
};

export { generateAccessToken, generateRefreshToken };
