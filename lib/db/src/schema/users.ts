import { pgTable, text, integer, timestamp, serial, boolean } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  googleId: text("google_id"),
  avatarUrl: text("avatar_url"),
  plan: text("plan").notNull().default("free"),
  isAdmin: boolean("is_admin").notNull().default(false),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerifyToken: text("email_verify_token"),
  emailVerifyExpires: timestamp("email_verify_expires"),
  ipAddress: text("ip_address"),
  deviceFingerprint: text("device_fingerprint"),
  lastGenerationAt: timestamp("last_generation_at"),
  freeGenerationsUsed: integer("free_generations_used").notNull().default(0),
  freeGenerationsLimit: integer("free_generations_limit").notNull().default(5),
  proGenerationsUsed: integer("pro_generations_used").notNull().default(0),
  proGenerationsLimit: integer("pro_generations_limit").notNull().default(200),
  creditBalance: integer("credit_balance").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
