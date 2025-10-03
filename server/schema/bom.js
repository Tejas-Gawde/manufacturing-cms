import {
  pgTable,
  serial,
  varchar,
  jsonb,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const boms = pgTable("boms", {
  id: serial("id").primaryKey(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: integer().notNull(),
  components: jsonb("components").notNull(),
  workOrder: jsonb("work_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});
