import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  boolean,
  text,
  jsonb,
} from "drizzle-orm/pg-core";

export const manufacturingOrders = pgTable("manufacturing_orders", {
  id: serial("id").primaryKey(),
  status: varchar("status", { length: 20 }).notNull(),
  deadline: timestamp("deadline", { withTimezone: false }).notNull(),
  bomId: integer("bom_id"), 
  workCenterId: integer("work_center_id").notNull(),
  createdBy: integer("created_by").notNull(),
  productName: varchar("product_name", { length: 255 }),
  components: jsonb("components").notNull(),
  workOrders: jsonb("work_orders").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});
