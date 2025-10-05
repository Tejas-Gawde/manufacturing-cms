
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
  