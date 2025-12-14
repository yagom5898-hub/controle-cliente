import { PrismaClient } from "@prisma/client";

let prismaInstance = null;

export function getPrisma() {
  const url = process.env.DATABASE_URL;
  try {
    console.log("ENV_DATABASE_URL_PRESENT=" + (url && url.trim() !== "" ? "true" : "false"));
  } catch {}
  if (!url || typeof url !== "string" || url.trim() === "") {
    return null;
  }
  if (globalThis.prismaInstance) {
    return globalThis.prismaInstance;
  }
  try {
    prismaInstance = new PrismaClient({
      log: ["warn", "error"],
    });
  } catch {
    return null;
  }
  globalThis.prismaInstance = prismaInstance;
  return prismaInstance;
}

export default null;

