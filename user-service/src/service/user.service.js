import prisma from "../config/prisma.js";
import redis from "./../config/redis.js";
const getProfileService = async (userId) => {
  const storedUser = await redis.get(`user:${userId}`);
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  const { password: _password, ...safeUser } = user;
  await redis.set(`user:${user.id}`, JSON.stringify(safeUser), "EX", 86400);
  return safeUser;
};

export { getProfileService };
