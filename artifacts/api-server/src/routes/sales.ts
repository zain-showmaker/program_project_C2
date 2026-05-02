import { Router, type IRouter } from "express";
import { db, componentsTable, salesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { RecordSaleBody, ReturnSaleParams } from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(row: typeof salesTable.$inferSelect) {
  const total = Number(row.total);
  const totalCost = Number(row.totalCost);
  return {
    id: row.id,
    componentId: row.componentId,
    category: row.category,
    model: row.model,
    quantity: row.quantity,
    unitPrice: Number(row.unitPrice),
    unitCost: Number(row.unitCost),
    total,
    totalCost,
    profit: Number((total - totalCost).toFixed(2)),
    customerName: row.customerName ?? null,
    isReturned: row.isReturned,
    returnedAt: row.returnedAt ? row.returnedAt.toISOString() : null,
    soldAt: row.soldAt.toISOString(),
  };
}

router.get("/sales", async (_req, res) => {
  const rows = await db.select().from(salesTable).orderBy(desc(salesTable.soldAt));
  res.json(rows.map(serialize));
});

router.post("/sales", async (req, res) => {
  const parsed = RecordSaleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { componentId, quantity, customerName } = parsed.data;

  const sale = await db.transaction(async (tx) => {
    const [comp] = await tx
      .select()
      .from(componentsTable)
      .where(eq(componentsTable.id, componentId))
      .limit(1);

    if (!comp) throw new Error("COMPONENT_NOT_FOUND");
    if (comp.quantity < quantity) throw new Error("INSUFFICIENT_STOCK");

    const unitPrice = Number(comp.price);
    const unitCost = Number(comp.cost);
    const total = unitPrice * quantity;
    const totalCost = unitCost * quantity;

    await tx
      .update(componentsTable)
      .set({ quantity: comp.quantity - quantity })
      .where(eq(componentsTable.id, componentId));

    const [row] = await tx
      .insert(salesTable)
      .values({
        componentId,
        category: comp.category,
        model: comp.model,
        quantity,
        unitPrice: unitPrice.toFixed(2),
        unitCost: unitCost.toFixed(2),
        total: total.toFixed(2),
        totalCost: totalCost.toFixed(2),
        customerName: customerName?.trim() ? customerName.trim() : null,
      })
      .returning();

    if (!row) throw new Error("INSERT_FAILED");
    return row;
  }).catch((err: Error) => {
    return { error: err.message } as const;
  });

  if ("error" in sale) {
    if (sale.error === "COMPONENT_NOT_FOUND") {
      res.status(404).json({ error: "Component not found" });
      return;
    }
    if (sale.error === "INSUFFICIENT_STOCK") {
      res.status(400).json({ error: "Insufficient stock" });
      return;
    }
    res.status(500).json({ error: sale.error });
    return;
  }

  res.status(201).json(serialize(sale));
});

router.post("/sales/:id/return", async (req, res) => {
  const params = ReturnSaleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.flatten() });
    return;
  }
  const id = params.data.id;

  const result = await db.transaction(async (tx) => {
    const [sale] = await tx.select().from(salesTable).where(eq(salesTable.id, id)).limit(1);
    if (!sale) throw new Error("SALE_NOT_FOUND");
    if (sale.isReturned) throw new Error("ALREADY_RETURNED");

    const [comp] = await tx
      .select()
      .from(componentsTable)
      .where(eq(componentsTable.id, sale.componentId))
      .limit(1);

    if (comp) {
      await tx
        .update(componentsTable)
        .set({ quantity: comp.quantity + sale.quantity })
        .where(eq(componentsTable.id, sale.componentId));
    }

    const [updated] = await tx
      .update(salesTable)
      .set({ isReturned: true, returnedAt: new Date() })
      .where(eq(salesTable.id, id))
      .returning();
    if (!updated) throw new Error("UPDATE_FAILED");
    return updated;
  }).catch((err: Error) => ({ error: err.message } as const));

  if ("error" in result) {
    if (result.error === "SALE_NOT_FOUND") {
      res.status(404).json({ error: "Sale not found" });
      return;
    }
    if (result.error === "ALREADY_RETURNED") {
      res.status(400).json({ error: "Sale already returned" });
      return;
    }
    res.status(500).json({ error: result.error });
    return;
  }

  res.json(serialize(result));
});

export default router;
