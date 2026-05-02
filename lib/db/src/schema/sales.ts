import { pgTable, serial, text, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";

export const salesTable = pgTable("sales", {
  id: serial("id").primaryKey(),
  componentId: integer("component_id").notNull(),
  category: text("category").notNull(),
  model: text("model").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  unitCost: numeric("unit_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  totalCost: numeric("total_cost", { precision: 12, scale: 2 }).notNull().default("0"),
  customerName: text("customer_name"),
  isReturned: boolean("is_returned").notNull().default(false),
  returnedAt: timestamp("returned_at", { withTimezone: true }),
  soldAt: timestamp("sold_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SaleRow = typeof salesTable.$inferSelect;
export type InsertSale = typeof salesTable.$inferInsert;
