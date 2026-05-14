import prisma from "../config/prisma.js";
import {
  BadRequestError,
  ConflictError,
  ForBiddenError,
  UnAuthorizedError,
} from "../utils/error.js";
import bcrypt from "bcrypt";
import { genrateAndStoreOtp, otpverify } from "../utils/otp.js";
import redis from "./../config/redis.js";
import { OAuth2Client } from "google-auth-library";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generate.token.js";
import jwt from "jsonwebtoken";
import { verfiyRefreshToken } from "../utils/verify.token.js";
import { addEmailJob } from "../jobs/email.job.js";
const CLIENT_ID =
  "630816969465-7pt5hvobg2ge8heig1bvksa95k4e4agd.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);
const sendOtp = async (firstName, lastName, email, password) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new ConflictError("User already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const meta = { firstName, lastName, email, hashedPassword };
  const { otp, otpSessionId } = await genrateAndStoreOtp(meta);
  await addEmailJob({ email, otp });
  return { otpSessionId };
};
const verifyotp = async (otp, otpSessionId) => {
  const meta = await otpverify(otp, otpSessionId);
  if (meta === null) {
    throw new BadRequestError("invalid or expired otp", "OTP INVALID");
  }
  const user = await prisma.user.create({
    data: {
      firstName: meta.firstName,
      lastName: meta.lastName,
      password: meta.hashedPassword,
      email: meta.email,
      emailVerified: true,
    },
  });
  return user;
};
const loginService = async (email, password, deviceId) => {
  const exisitingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!email) {
    throw new BadRequestError("Invalid  email or password");
  }
  const isMatchPassword = await bcrypt.compare(
    password,
    exisitingUser.password,
  );
  if (!isMatchPassword) {
    throw new BadRequestError("Invalid email or password");
  }

  const accessToken = generateAccessToken(exisitingUser.id);
  const refreshToken = generateRefreshToken(exisitingUser.id);
  const { jti } = jwt.decode(refreshToken);
  await redis.set(`refresh:${exisitingUser.id}:${deviceId}`, jti, "EX", 7);
  const { password: __password, ...safeUser } = exisitingUser;
  await redis.set(
    `user:${exisitingUser.id}`,
    JSON.stringify(safeUser),
    "EX",
    86400,
  );
  return { accessToken, refreshToken, loggedInUser: safeUser };
};
const rotateRefreshTokenService = async (refreshToken, deviceId) => {
  const payload = verfiyRefreshToken(refreshToken);
  const { id: userId, jti } = payload;
  const storedJti = await redis.get(`refresh:${userId}:${deviceId}`);
  if (!storedJti) {
    throw new ForBiddenError("Session expired", "LOGIN AGAIN");
  }
  if (storedJti !== jti) {
    await redis.del(`refresh:${us},${deviceId}`);
    throw new ForBiddenError("Refresh token reused", "LOGIN AGAIN");
  }
  const newAccessToken = generateAccessToken(payload.id);
  const newRefreshToken = generateRefreshToken(payload.id);
  const { jti: newJti } = jwt.decode(newRefreshToken);
  await redis.set(`refresh:${payload.id},${deviceId}`, newJti, "EX", 7);
  return { newAccessToken, newRefreshToken };
};
const verifyGoogleIdTokenService = async (idToken) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload.sub || !payload.email) {
    throw new UnAuthorizedError("Invalid Google Token Payload");
  }
  const goolgeUser = {
    provider: payload.iss,
    providerId: payload.sub,
    email: payload.email,
    firstName: payload.given_name,
    lastName: payload.family_name,
    emailVerified: payload.email_verified || false,
  };
  const user = await prisma.$transaction(async (tx) => {
    let googleAuth = await tx.authProvider.findUnique({
      where: {
        provider_providerId: {
          provider: goolgeUser.provider,
          providerId: goolgeUser.providerId,
        },
      },
      include: { user: true },
    });
    if (googleAuth) {
      return googleAuth.user;
    }

    let exisitingUser = await tx.user.findUnique({
      where: { email: goolgeUser.email },
    });
    if (exisitingUser) {
      tx.authProvider.create({
        data: {
          provider: goolgeUser.provider,
          providerId: goolgeUser.providerId,
          userId: exisitingUser.id,
        },
      });
      return exisitingUser;
    }
    return await tx.user.create({
      data: {
        email: goolgeUser.email,
        firstName: goolgeUser.firstName,
        lastName: goolgeUser.lastName,
        emailVerified: goolgeUser.emailVerified,
        AuthProviders: {
          create: {
            provider: goolgeUser.provider,
            providerId: goolgeUser.providerId,
          },
        },
      },
    });
  });
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const { jti } = jwt.decode(refreshToken);
  await redis.set(`refresh:${user.id}:${deviceId}`, jti, "EX", 7);
  const { password: __password, ...safeUser } = user;
  await redis.set(`user:${user.id}`, JSON.stringify(safeUser), "EX", 86400);
  return { accessToken, refreshToken, loggedInUser: safeUser };
};

export {
  sendOtp,
  verifyotp,
  loginService,
  rotateRefreshTokenService,
  verifyGoogleIdTokenService,
};
