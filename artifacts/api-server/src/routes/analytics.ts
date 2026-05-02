import { Router, type IRouter } from "express";
import { db, componentsTable, salesTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { GetLowStockQueryParams, GetBestSellersQueryParams, GetSlowMoversQueryParams } from "@workspace/api-zod";
import { getLowStockItems } from "./components";

const LOW_STOCK_THRESHOLD = 3;

const router: IRouter = Router();

const NOT_RETURNED = sql`${salesTable.isReturned} = false`;

router.get("/analytics/summary", async (_req, res) => {
  const [invAgg] = await db
    .select({
      totalItems: sql<number>`count(*)::int`,
      totalUnits: sql<number>`coalesce(sum(${componentsTable.quantity}), 0)::int`,
      totalValue: sql<number>`coalesce(sum(${componentsTable.quantity} * ${componentsTable.price}), 0)::float`,
      totalCostValue: sql<number>`coalesce(sum(${componentsTable.quantity} * ${componentsTable.cost}), 0)::float`,
      lowStockCount: sql<number>`count(*) filter (where ${componentsTable.quantity} < ${LOW_STOCK_THRESHOLD})::int`,
    })
    .from(componentsTable);

  const [salesAgg] = await db
    .select({
      totalRevenue: sql<number>`coalesce(sum(${salesTable.total}) filter (where ${salesTable.isReturned} = false), 0)::float`,
      totalCogs: sql<number>`coalesce(sum(${salesTable.totalCost}) filter (where ${salesTable.isReturned} = false), 0)::float`,
      totalTransactions: sql<number>`count(*) filter (where ${salesTable.isReturned} = false)::int`,
      todayRevenue: sql<number>`coalesce(sum(${salesTable.total}) filter (where ${salesTable.isReturned} = false and ${salesTable.soldAt} >= date_trunc('day', now())), 0)::float`,
      todayCogs: sql<number>`coalesce(sum(${salesTable.totalCost}) filter (where ${salesTable.isReturned} = false and ${salesTable.soldAt} >= date_trunc('day', now())), 0)::float`,
      todayTransactions: sql<number>`count(*) filter (where ${salesTable.isReturned} = false and ${salesTable.soldAt} >= date_trunc('day', now()))::int`,
    })
    .from(salesTable);

  const topCatRows = await db
    .select({
      category: salesTable.category,
      revenue: sql<number>`sum(${salesTable.total})::float`,
    })
    .from(salesTable)
    .where(NOT_RETURNED)
    .groupBy(salesTable.category)
    .orderBy(sql`sum(${salesTable.total}) desc`)
    .limit(1);

  const totalRevenue = salesAgg?.totalRevenue ?? 0;
  const totalCogs = salesAgg?.totalCogs ?? 0;
  const totalProfit = Number((totalRevenue - totalCogs).toFixed(2));
  const todayRevenue = salesAgg?.todayRevenue ?? 0;
  const todayCogs = salesAgg?.todayCogs ?? 0;
  const todayProfit = Number((todayRevenue - todayCogs).toFixed(2));
  const marginPct = totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(2)) : 0;

  res.json({
    totalItems: invAgg?.totalItems ?? 0,
    totalUnits: invAgg?.totalUnits ?? 0,
    totalValue: invAgg?.totalValue ?? 0,
    totalCostValue: invAgg?.totalCostValue ?? 0,
    lowStockCount: invAgg?.lowStockCount ?? 0,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    todayRevenue,
    todayProfit,
    todayTransactions: salesAgg?.todayTransactions ?? 0,
    totalRevenue,
    totalProfit,
    marginPct,
    totalTransactions: salesAgg?.totalTransactions ?? 0,
    topCategory: topCatRows[0]?.category ?? null,
  });
});

router.get("/analytics/daily-revenue", async (_req, res) => {
  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${salesTable.soldAt}), 'YYYY-MM-DD')`,
      revenue: sql<number>`sum(${salesTable.total})::float`,
      profit: sql<number>`sum(${salesTable.total} - ${salesTable.totalCost})::float`,
      transactions: sql<number>`count(*)::int`,
    })
    .from(salesTable)
    .where(sql`${salesTable.soldAt} >= now() - interval '30 days' and ${salesTable.isReturned} = false`)
    .groupBy(sql`date_trunc('day', ${salesTable.soldAt})`)
    .orderBy(sql`date_trunc('day', ${salesTable.soldAt}) asc`);

  res.json(rows);
});

router.get("/analytics/category-revenue", async (_req, res) => {
  const rows = await db
    .select({
      category: salesTable.category,
      revenue: sql<number>`sum(${salesTable.total})::float`,
      profit: sql<number>`sum(${salesTable.total} - ${salesTable.totalCost})::float`,
      units: sql<number>`sum(${salesTable.quantity})::int`,
    })
    .from(salesTable)
    .where(NOT_RETURNED)
    .groupBy(salesTable.category)
    .orderBy(sql`sum(${salesTable.total}) desc`);

  res.json(rows);
});

router.get("/analytics/low-stock", async (req, res) => {
  const parsed = GetLowStockQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const threshold = parsed.data.threshold ?? LOW_STOCK_THRESHOLD;
  const items = await getLowStockItems(threshold);
  res.json(items);
});

router.get("/analytics/best-sellers", async (req, res) => {
  const parsed = GetBestSellersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const limit = parsed.data.limit ?? 10;

  const rows = await db
    .select({
      componentId: salesTable.componentId,
      category: salesTable.category,
      model: salesTable.model,
      unitsSold: sql<number>`sum(${salesTable.quantity})::int`,
      revenue: sql<number>`sum(${salesTable.total})::float`,
      profit: sql<number>`sum(${salesTable.total} - ${salesTable.totalCost})::float`,
      currentStock: sql<number>`coalesce(max(${componentsTable.quantity}), 0)::int`,
    })
    .from(salesTable)
    .leftJoin(componentsTable, sql`${salesTable.componentId} = ${componentsTable.id}`)
    .where(NOT_RETURNED)
    .groupBy(salesTable.componentId, salesTable.category, salesTable.model)
    .orderBy(sql`sum(${salesTable.quantity}) desc`)
    .limit(limit);

  res.json(rows);
});

router.get("/analytics/slow-movers", async (req, res) => {
  const parsed = GetSlowMoversQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const limit = parsed.data.limit ?? 10;

  const rows = await db
    .select({
      componentId: componentsTable.id,
      category: componentsTable.category,
      model: componentsTable.model,
      currentStock: componentsTable.quantity,
      unitsSold: sql<number>`coalesce(sum(${salesTable.quantity}) filter (where ${salesTable.isReturned} = false and ${salesTable.soldAt} >= now() - interval '30 days'), 0)::int`,
      revenue: sql<number>`coalesce(sum(${salesTable.total}) filter (where ${salesTable.isReturned} = false and ${salesTable.soldAt} >= now() - interval '30 days'), 0)::float`,
      profit: sql<number>`coalesce(sum(${salesTable.total} - ${salesTable.totalCost}) filter (where ${salesTable.isReturned} = false and ${salesTable.soldAt} >= now() - interval '30 days'), 0)::float`,
    })
    .from(componentsTable)
    .leftJoin(salesTable, sql`${salesTable.componentId} = ${componentsTable.id}`)
    .groupBy(componentsTable.id, componentsTable.category, componentsTable.model, componentsTable.quantity)
    .orderBy(sql`coalesce(sum(${salesTable.quantity}) filter (where ${salesTable.isReturned} = false and ${salesTable.soldAt} >= now() - interval '30 days'), 0) asc, ${componentsTable.id} asc`)
    .limit(limit);

  res.json(
    rows.map((r) => ({
      componentId: r.componentId,
      category: r.category,
      model: r.model,
      unitsSold: r.unitsSold,
      revenue: r.revenue,
      profit: r.profit,
      currentStock: r.currentStock,
    })),
  );
});

router.get("/analytics/reorder", async (_req, res) => {
  const rows = await db
    .select({
      id: componentsTable.id,
      category: componentsTable.category,
      model: componentsTable.model,
      currentStock: componentsTable.quantity,
      sold30d: sql<number>`coalesce(sum(${salesTable.quantity}) filter (where ${salesTable.isReturned} = false and ${salesTable.soldAt} >= now() - interval '30 days'), 0)::int`,
    })
    .from(componentsTable)
    .leftJoin(salesTable, sql`${salesTable.componentId} = ${componentsTable.id}`)
    .groupBy(componentsTable.id, componentsTable.category, componentsTable.model, componentsTable.quantity);

  const ranked = rows
    .map((r) => {
      const dailyRate = r.sold30d / 30;
      const daysOfStock = dailyRate > 0 ? Number((r.currentStock / dailyRate).toFixed(1)) : null;
      let urgency: "critical" | "low" | "ok" = "ok";
      if (r.currentStock === 0 && r.sold30d > 0) urgency = "critical";
      else if (r.currentStock < LOW_STOCK_THRESHOLD) urgency = "critical";
      else if (daysOfStock !== null && daysOfStock < 14) urgency = "low";
      return { ...r, daysOfStock, urgency };
    })
    .filter((r) => r.urgency !== "ok")
    .sort((a, b) => {
      const ord = { critical: 0, low: 1, ok: 2 } as const;
      if (ord[a.urgency] !== ord[b.urgency]) return ord[a.urgency] - ord[b.urgency];
      const aDays = a.daysOfStock ?? 9999;
      const bDays = b.daysOfStock ?? 9999;
      return aDays - bDays;
    });

  res.json(ranked);
});

export default router;
