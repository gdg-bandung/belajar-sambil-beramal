import { authService } from "../app/server/auth-service.server";
import { db } from "../app/db/index.server";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";
import { users } from "../app/db/schema";

async function main() {
  let superadminData;
  try {
    const dataPath = join(process.cwd(), "scripts", "superadmin-data.json");
    superadminData = JSON.parse(readFileSync(dataPath, "utf-8"));
  } catch (error) {
    console.error("❌ Error reading scripts/superadmin-data.json:", error);
    process.exit(1);
  }

  const { email, password, name } = superadminData;

  console.log(`Checking for existing user: ${email}...`);
  const existingUser = await db.select().from(users).where(eq(users.email, email));

  if (existingUser.length > 0) {
    console.log("User already exists. Skipping creation.");
    process.exit(0);
  }

  console.log("Creating Superadmin account...");
  try {
    const user = await authService.createAdmin(email, password, name, "superadmin");
    console.log("✅ Superadmin created successfully!");
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    console.error("❌ Error creating superadmin:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
