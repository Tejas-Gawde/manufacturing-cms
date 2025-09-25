import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const stockLedger = pgTable("stock_ledger", {
  id: serial("id").primaryKey(),
  materialName: varchar("material_name", { length: 255 }).notNull(),
  materialType: varchar("material_type", { length: 20 }).notNull(), // 'finished_goods' | 'raw_materials'
  quantity: integer("quantity").notNull(), // can be +ve (in) or -ve (out)
  unit: varchar("unit", { length: 20 }).notNull().default("piece"),
  unitCost: integer("unit_cost").notNull(),
  totalValue: integer("total_value"),
  date: timestamp("date", { withTimezone: false }).defaultNow().notNull(), // Re-added
  workOrderId: integer("work_order_id"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});
