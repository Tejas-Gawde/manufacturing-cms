import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  boolean,
  text,
} from "drizzle-orm/pg-core";

export const manufacturingOrders = pgTable("manufacturing_orders", {
  id: serial("id").primaryKey(),
  status: varchar("status", { length: 20 }).notNull(),
  deadline: timestamp("deadline", { withTimezone: false }).notNull(),
  bomId: integer("bom_id").notNull(),
  workCenterId: integer("work_center_id").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  moId: integer("mo_id").notNull(),
  assignedTo: integer("assigned_to"),
  status: varchar("status", { length: 20 }).notNull(),
  stepName: varchar("step_name", { length: 255 }).notNull(),
  estimatedTime: integer("estimated_time").notNull(),
  inheritedFromBom: boolean("inherited_from_bom").notNull().default(false),
  startedAt: timestamp("started_at", { withTimezone: false }),
  completedAt: timestamp("completed_at", { withTimezone: false }),
  comments: text("comments"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});
