import { db } from "@/db/index.server";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key-change-me");

export type UserRole = "speaker" | "admin" | "superadmin";

export const authService = {
  // Register a new user (Speaker)
  async registerSpeaker(email: string, password: string, name: string) {
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash: hashedPassword,
      name,
      role: "speaker",
    }).returning();

    return this.createSession(newUser);
  },

  // Create a new Admin (Superadmin only)
  async createAdmin(email: string, password: string, name: string, role: "admin" | "superadmin" = "admin") {
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [newAdmin] = await db.insert(users).values({
      email,
      passwordHash: hashedPassword,
      name,
      role, // 'admin' or 'superadmin'
    }).returning();

    return newAdmin;
  },

  // Get all admins (Superadmin only)
  async getAllAdmins() {
    return await db.select().from(users).where(or(eq(users.role, "admin"), eq(users.role, "superadmin")));
  },

  // Login
  async login(email: string, password: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    return this.createSession(user);
  },

  // Delete Admin (Superadmin only)
  async deleteUser(userId: string) {
    await db.delete(users).where(eq(users.id, userId));
  },

  // JWT Helper
  async createSession(user: typeof users.$inferSelect) {
    const token = await new SignJWT({ 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name
      })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(SECRET_KEY);

    // In a real server framework (Express/Hono/Next), you would set this string as a 'Set-Cookie' header.
    // Example: 
    // "Set-Cookie": `auth_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; Secure`
    
    return { 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name 
      },
      token // Return token so the controller can set the cookie
    };
  },

  // Verify Token (from Cookie)
  async verifyToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      return payload as { id: string; email: string; role: UserRole; name: string };
    } catch (e) {
      return null;
    }
  }
};
