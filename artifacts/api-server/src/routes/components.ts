import { Router, type IRouter } from "express";
import { db, componentsTable } from "@workspace/db";
import { and, asc, eq, ilike, inArray, sql } from "drizzle-orm";
import {
  ListComponentsQueryParams,
  CreateComponentBody,
  UpdateComponentBody,
  UpdateComponentParams,
  DeleteComponentParams,
  BulkDeleteComponentsBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(row: typeof componentsTable.$inferSelect) {
  const price = Number(row.price);
  const cost = Number(row.cost);
  const marginPct = price > 0 ? Number((((price - cost) / price) * 100).toFixed(2)) : 0;
  return {
    id: row.id,
    category: row.category,
    model: row.model,
    quantity: row.quantity,
    price,
    cost,
    imageUrl: row.imageUrl ?? null,
    marginPct,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/components", async (req, res) => {
  const parsed = ListComponentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { category, search } = parsed.data;

  const filters = [];
  if (category) filters.push(eq(componentsTable.category, category.toUpperCase()));
  if (search) filters.push(ilike(componentsTable.model, `%${search}%`));

  const rows = await db
    .select()
    .from(componentsTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(asc(componentsTable.id));

  res.json(rows.map(serialize));
});

router.post("/components", async (req, res) => {
  const parsed = CreateComponentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { category, model, quantity, price, cost, imageUrl } = parsed.data;
  const effectiveCost = cost ?? price * 0.7;

  const [row] = await db
    .insert(componentsTable)
    .values({
      category: category.toUpperCase(),
      model,
      quantity,
      price: price.toFixed(2),
      cost: effectiveCost.toFixed(2),
      imageUrl: imageUrl ?? null,
    })
    .returning();

  if (!row) {
    res.status(500).json({ error: "Failed to insert" });
    return;
  }
  res.status(201).json(serialize(row));
});

router.post("/components/bulk-delete", async (req, res) => {
  const parsed = BulkDeleteComponentsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const ids = parsed.data.ids;
  if (ids.length === 0) {
    res.json({ deleted: 0 });
    return;
  }
  const result = await db
    .delete(componentsTable)
    .where(inArray(componentsTable.id, ids))
    .returning({ id: componentsTable.id });
  res.json({ deleted: result.length });
});

router.patch("/components/:id", async (req, res) => {
  const params = UpdateComponentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.flatten() });
    return;
  }
  const body = UpdateComponentBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.flatten() });
    return;
  }

  const id = params.data.id;
  const existing = await db
    .select()
    .from(componentsTable)
    .where(eq(componentsTable.id, id))
    .limit(1);

  if (!existing[0]) {
    res.status(404).json({ error: "Component not found" });
    return;
  }

  const updates: Partial<typeof componentsTable.$inferInsert> = {};
  if (body.data.price !== undefined) updates.price = body.data.price.toFixed(2);
  if (body.data.cost !== undefined) updates.cost = body.data.cost.toFixed(2);
  if (body.data.imageUrl !== undefined) updates.imageUrl = body.data.imageUrl;

  let nextQty = existing[0].quantity;
  if (body.data.setQuantity !== undefined) {
    nextQty = body.data.setQuantity;
  } else if (body.data.addQuantity !== undefined) {
    nextQty = Math.max(0, existing[0].quantity + body.data.addQuantity);
  }
  updates.quantity = nextQty;

  const [row] = await db
    .update(componentsTable)
    .set(updates)
    .where(eq(componentsTable.id, id))
    .returning();

  if (!row) {
    res.status(500).json({ error: "Failed to update" });
    return;
  }
  res.json(serialize(row));
});

router.delete("/components/:id", async (req, res) => {
  const params = DeleteComponentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.flatten() });
    return;
  }
  await db.delete(componentsTable).where(eq(componentsTable.id, params.data.id));
  res.status(204).end();
});

export async function getLowStockItems(threshold: number) {
  const rows = await db
    .select()
    .from(componentsTable)
    .where(sql`${componentsTable.quantity} < ${threshold}`)
    .orderBy(asc(componentsTable.quantity));
  return rows.map(serialize);
}

export default router;
