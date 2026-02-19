import { pgTable, text, timestamp, uuid, date, time, varchar, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["speaker", "admin", "superadmin"]);

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  whatsapp: varchar("whatsapp", { length: 20 }),
  role: text("role"), // This is the speaker's job title, NOT the auth role
  institution: text("institution"),
  topicCategory: text("topic_category"),
  topicTitle: text("topic_title").notNull(),
  description: text("description"),
  biography: text("biography"),
  photo: text("photo"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  eventDate: date("event_date"),
  eventTime: time("event_time"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").default("speaker").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});