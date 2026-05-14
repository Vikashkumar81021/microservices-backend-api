import { TooManyRequestError } from "./error.js";
import otpGenrator from "otp-generator";
import redis from "./../config/redis.js";
import crypto from "crypto";

const HmacSecretKey = "hmacsercretforotp";
function hmacFor(email, otp) {
  return crypto
    .createHmac("sha256", HmacSecretKey)
    .update(email + ":" + otp)
    .digest("hex");
}

const genrateAndStoreOtp = async (meta) => {
  //this variable tell how many sned send an hour
  const rateKey = `otp:rate:${meta.email}`;
  const sendCount = parseInt((await redis.get(rateKey)) || "0", 10);
  if (sendCount >= 5) {
    throw new TooManyRequestError(
      "Too Many Otp Request.Try again later",
      "Otp rate limit",
    );
  }
  const otp = otpGenrator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
  const otpSessionId = crypto.randomUUID();
  const hashOtp = hmacFor(meta.email, otp);
  await redis.set(
    `otp:session:${otpSessionId}`,
    JSON.stringify({
      hashedOtp: hashOtp,
      meta,
    }),
    {
      EX: 300,
    },
  );
  await redis.incr(rateKey);
  await redis.expire(rateKey, 3600);
  return { otp, otpSessionId };
};

const otpverify = async (otp, otpsesionId) => {
  const rawData = await redis.get(`otp:session:${otpsesionId}`);

  if (!rawData) return null;

  const { hashedOtp: storeOtp, meta } = JSON.parse(rawData);
  const attempKeys = `otp:attemepets:${meta?.email}`;
  const countAttempets = parseInt((await redis.get(attempKeys)) || "0", 10);
  if (countAttempets >= 5) {
    throw new TooManyRequestError("To Many attempts on verify otp");
  }
  const hashed = hmacFor(meta.email, otp);
  if (
    crypto.timingSafeEqual(
      Buffer.from(hashed, "hex"),
      Buffer.from(storeOtp, "hex"),
    )
  ) {
    await redis.del(`otp:session:${otpsesionId}`, attempKeys);
    await redis.del(`otp:rate:${meta.email}`);
    return meta;
  } else {
    await redis.incr(attempKeys);
    await redis.expire(attempKeys, 3600);
    return null;
  }
};
export { genrateAndStoreOtp, otpverify };
