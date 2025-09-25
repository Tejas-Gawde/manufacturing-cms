import {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
} from "drizzle-orm/pg-core";

export const workCenters = pgTable("work_centers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  capacity: integer("capacity").notNull(),
  costPerHour: numeric("cost_per_hour").notNull(),
});
