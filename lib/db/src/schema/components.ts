import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";

export const componentsTable = pgTable("components", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  model: text("model").notNull(),
  quantity: integer("quantity").notNull().default(0),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull().default("0"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ComponentRow = typeof componentsTable.$inferSelect;
export type InsertComponent = typeof componentsTable.$inferInsert;
