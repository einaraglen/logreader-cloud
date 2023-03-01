import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const Prisma = async () => {
  try {
    const client = new PrismaClient();
    await client.$connect();
    global.prisma = client;
    console.log("Prisma client connected");
  } catch (e) {
    console.log("Could not connect to database..", e);
  }
};

const prisma = global.prisma || new PrismaClient();

export default prisma;
