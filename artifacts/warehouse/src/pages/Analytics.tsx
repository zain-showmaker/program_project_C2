import { Shell } from "@/components/layout/Shell";
import {
  useGetDailyRevenue,
  useGetCategoryRevenue,
  useGetDashboardSummary,
  useGetBestSellers,
  useGetSlowMovers,
  useGetReorderList,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, AlertTriangle, PiggyBank } from "lucide-react";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-5))",
];

export default function Analytics() {
  const { data: dailyRevenue } = useGetDailyRevenue();
  const { data: categoryRevenue } = useGetCategoryRevenue();
  const { data: summary } = useGetDashboardSummary();
  const { data: bestSellers } = useGetBestSellers({ limit: 8 });
  const { data: slowMovers } = useGetSlowMovers({ limit: 8 });
  const { data: reorderList } = useGetReorderList();

  const avgOrder = summary?.totalTransactions
    ? Math.round(summary.totalRevenue / summary.totalTransactions)
    : 0;

  return (
    <Shell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">Business performance, profit, and inventory insights.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Lifetime Revenue" value={`$${summary?.totalRevenue?.toLocaleString() || "0"}`} />
          <KpiCard label="Lifetime Profit" value={`$${summary?.totalProfit?.toLocaleString() || "0"}`} accent="text-emerald-500" />
          <KpiCard label="Margin" value={`${summary?.marginPct?.toFixed(1) || "0"}%`} />
          <KpiCard label="Avg Order Value" value={`$${avgOrder.toLocaleString()}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1 lg:col-span-2 border-border/50 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-sm font-medium">Revenue vs Profit (30 Days)</CardTitle>
                <CardDescription className="text-xs">Daily gross revenue and profit</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[320px] w-full">
                {dailyRevenue && dailyRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyRevenue} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => format(new Date(val), "MMM d")}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val}`}
                        dx={-10}
                      />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "6px",
                          fontSize: "12px",
                          boxShadow: "var(--shadow-sm)",
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
                        labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
                        formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === "revenue" ? "Revenue" : "Profit"]}
                        labelFormatter={(label) => format(new Date(label), "MMM d, yyyy")}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} maxBarSize={26} name="Revenue" />
                      <Bar dataKey="profit" fill="rgb(16, 185, 129)" radius={[2, 2, 0, 0]} maxBarSize={26} name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No revenue data available</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-sm font-medium">Revenue by Category</CardTitle>
                <CardDescription className="text-xs">Distribution of total revenue</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[280px] w-full">
                {categoryRevenue && categoryRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryRevenue}
                        dataKey="revenue"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {categoryRevenue.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "6px",
                          fontSize: "12px",
                          boxShadow: "var(--shadow-sm)",
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No category data available</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-sm font-medium">Profit by Category</CardTitle>
                <CardDescription className="text-xs">Lifetime profit per category</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[280px] w-full">
                {categoryRevenue && categoryRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryRevenue} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "6px",
                          fontSize: "12px",
                          boxShadow: "var(--shadow-sm)",
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Profit"]}
                      />
                      <Bar dataKey="profit" fill="rgb(16, 185, 129)" radius={[0, 2, 2, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No category data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-border/50 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Best Sellers
              </CardTitle>
              <CardDescription className="text-xs">Top performers by units sold</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {bestSellers && bestSellers.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {bestSellers.map((item, idx) => (
                    <div key={item.componentId} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                      <div className="w-6 text-center text-xs font-mono font-medium text-muted-foreground tabular-nums">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{item.model}</div>
                        <div className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                          {item.category} · {item.unitsSold} sold · ${item.revenue.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right tabular-nums">
                        <div className="text-xs font-semibold text-emerald-500">+${item.profit.toFixed(0)}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">stock {item.currentStock}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">No sales data yet.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-muted-foreground" />
                Slow Movers
              </CardTitle>
              <CardDescription className="text-xs">Bottom performers (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {slowMovers && slowMovers.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {slowMovers.map((item) => (
                    <div key={item.componentId} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{item.model}</div>
                        <div className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                          {item.category} · {item.unitsSold} sold last 30d
                        </div>
                      </div>
                      <div className="text-right tabular-nums">
                        <div className="text-xs font-semibold text-muted-foreground">{item.unitsSold}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">stock {item.currentStock}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">No data yet.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Reorder Suggestions
              </CardTitle>
              <CardDescription className="text-xs">Ranked by stockout risk</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {reorderList && reorderList.length > 0 ? (
                <div className="divide-y divide-border/40 max-h-[420px] overflow-y-auto">
                  {reorderList.map((item) => (
                    <div key={item.id} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate flex items-center gap-2">
                          {item.model}
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider ${
                              item.urgency === "critical"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-amber-500/15 text-amber-500"
                            }`}
                          >
                            {item.urgency}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                          {item.category} · {item.sold30d} sold/30d
                          {item.daysOfStock !== null && item.daysOfStock !== undefined && ` · ${item.daysOfStock}d left`}
                        </div>
                      </div>
                      <div className="text-right tabular-nums">
                        <div className={`text-sm font-semibold ${item.currentStock === 0 ? "text-destructive" : "text-foreground"}`}>
                          {item.currentStock}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">on hand</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                  <PiggyBank className="w-6 h-6 text-muted-foreground/40" />
                  Inventory levels look healthy.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Card className="border-border/50 shadow-xs">
      <CardHeader className="pb-2 border-b border-transparent">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className={`text-3xl font-semibold tabular-nums ${accent ?? ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
