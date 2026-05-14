import { asyncHandler } from "../utils/asyncHandler.js";
import { BadRequestError, UnAuthorizedError } from "../utils/error.js";
import {
  loginService,
  rotateRefreshTokenService,
  sendOtp,
  verifyotp,
  verifyGoogleIdTokenService,
} from "../service/auth.service.js";
import { getDeviceFingerprint } from "../utils/deviceFingerPrint.js";
const otp = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError("All fields are required");
  }
  const { otpSessionId } = await sendOtp(firstName, lastName, email, password);

  res
    .cookie("otp_sesionId", otpSessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({ success: true, message: "OTP sent successfully" });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const otpSesionId = req.cookies.otp_sesionId;
  if (!otp || !otpSesionId) {
    throw new BadRequestError("Missing fileds are required", 400);
  }
  const user = await verifyotp(otp, otpSesionId);
  res.status(201).json({
    success: true,
    message: "Account creation succesfully",
    data: user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  if (!email || !password) {
    throw new BadRequestError("missing fields are required");
  }
  const deviceId = getDeviceFingerprint(req);
  console.log("deviceID", deviceId);

  const { accessToken, refreshToken, loggedInUser } = await loginService(
    email,
    password,
    deviceId,
  );
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      success: true,
      message: "Login Sucessfully",
      loggedInUser,
    });
});
const rotateToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    throw new UnAuthorizedError("Refreshtoken is missing", "LOGIN AGAIN");
  }
  const deviceId = getDeviceFingerprint(req);
  const { newAccessToken, newRefreshToken } = await rotateRefreshTokenService(
    refreshToken,
    deviceId,
  );
  res.cookie("access_token", newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res
    .cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      success: true,
      message: "Accesstoken and refreshtoken is reIssueed",
    });
});
const verifyGoogleIdToken = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    throw new BadRequestError("Invalid Google Id,Token", "INVALID TOKEN");
  }
  const deviceId = getDeviceFingerprint(req);
  const { accessToken, refreshToken, loggedInUser } =
    await verifyGoogleIdTokenService(idToken, deviceId);
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      success: true,
      message: "LoggedIn user Successfully",
      loggedInUser,
    });
});

export { otp, verifyOtp, login, rotateToken, verifyGoogleIdToken };
