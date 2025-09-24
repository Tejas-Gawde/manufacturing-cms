import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const rolesEnum = ["admin", "manager", "operator", "inventory"];

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  resetOtp: varchar("reset_otp", { length: 10 }),
  resetOtpExpiresAt: timestamp("reset_otp_expires_at", { withTimezone: false }),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});
