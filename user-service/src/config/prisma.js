// import PrismaClient from "@prisma/client";
// import { config } from ".";

// const globalForPrisma = global;

// const prisma = globalForPrisma.prisma ?? new PrismaClient();

// if (config.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }

// export { prisma };

import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default prisma;
