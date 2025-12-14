import { PrismaClient } from "@prisma/client";

let prismaInstance = null;

export function getPrisma() {
  const url = process.env.DATABASE_URL;
  if (!url || typeof url !== "string" || url.trim() === "" || !/^postgres(ql)?:\/\//i.test(url)) {
    return null;
  }
  if (globalThis.prismaInstance) {
    return globalThis.prismaInstance;
  }
  prismaInstance = new PrismaClient({
    log: ["warn", "error"],
  });
  globalThis.prismaInstance = prismaInstance;
  return prismaInstance;
}

const prisma = getPrisma();
export default prisma;

