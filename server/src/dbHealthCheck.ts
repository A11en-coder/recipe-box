// this file checks the health of the database connection using Prisma Client
import { prisma } from "./db";

export async function checkDatabaseHealth() {
  try {
    // Attempt to connect to the database
    await prisma.$connect();
    console.log("Database connection is healthy.");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

checkDatabaseHealth()
