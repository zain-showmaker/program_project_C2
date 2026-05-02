import { Shell } from "@/components/layout/Shell";
import {
  useGetDashboardSummary,
  useGetDailyRevenue,
  useGetLowStock,
  useListSales,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, DollarSign, Activity, PiggyBank } from "lucide-react";
import { format } from "date-fns";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: dailyRevenue } = useGetDailyRevenue();
  const { data: lowStock } = useGetLowStock({ threshold: 3 });
  const { data: recentSales } = useListSales();

  return (
    <Shell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Overview of your inventory and recent sales.</p>
        </div>

        {isSummaryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse bg-muted/20 h-32 border-border/50 shadow-none" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border/50 shadow-xs">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Today's Revenue</p>
                    <p className="text-3xl font-semibold tabular-nums">${summary?.todayRevenue?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs">
                  <TrendingUp className="w-3 h-3 mr-1.5 text-primary" />
                  <span className="text-muted-foreground">
                    <span className="text-foreground font-medium">{summary?.todayTransactions || 0}</span> transactions
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 shadow-xs">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Today's Profit</p>
                    <p className="text-3xl font-semibold tabular-nums text-emerald-500">
                      ${summary?.todayProfit?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center">
                    <PiggyBank className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Lifetime margin <span className="text-foreground font-medium">{summary?.marginPct?.toFixed(1) || "0"}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 shadow-xs">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Inventory Value</p>
                    <p className="text-3xl font-semibold tabular-nums">${summary?.totalValue?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Cost basis <span className="text-foreground font-medium">${summary?.totalCostValue?.toLocaleString() || "0"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 shadow-xs relative overflow-hidden">
              {summary?.lowStockCount ? <div className="absolute top-0 left-0 w-1 h-full bg-destructive" /> : null}
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Low Stock</p>
                    <p className="text-3xl font-semibold tabular-nums">{summary?.lowStockCount || 0}</p>
                  </div>
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${summary?.lowStockCount ? "bg-destructive/10" : "bg-primary/5"}`}>
                    <AlertTriangle className={`w-4 h-4 ${summary?.lowStockCount ? "text-destructive" : "text-primary"}`} />
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Items below threshold ({summary?.lowStockThreshold || 3})
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 shadow-xs">
              <CardHeader className="pb-2 border-b border-border/40">
                <CardTitle className="text-sm font-medium">Revenue & Profit</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[280px] w-full">
                  {dailyRevenue && dailyRevenue.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyRevenue} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="rgb(16, 185, 129)" stopOpacity={0.22} />
                            <stop offset="95%" stopColor="rgb(16, 185, 129)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
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
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRevenue)" />
                        <Area type="monotone" dataKey="profit" stroke="rgb(16, 185, 129)" strokeWidth={1.5} fillOpacity={1} fill="url(#colorProfit)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No revenue data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-xs">
              <CardHeader className="pb-4 border-b border-border/40">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-destructive"></span>
                  Low Stock Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {lowStock && lowStock.length > 0 ? (
                  <div className="divide-y divide-border/40">
                    {lowStock.slice(0, 5).map((item) => (
                      <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                        <div>
                          <div className="font-medium text-sm text-foreground">{item.model}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.category} <span className="text-border mx-1">•</span> <span className="font-mono text-[10px]">#{item.id}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-destructive/10 text-destructive text-xs font-semibold">
                            {item.quantity} left
                          </span>
                        </div>
                      </div>
                    ))}
                    {lowStock.length > 5 && (
                      <div className="px-6 py-3 text-center text-xs text-muted-foreground hover:bg-muted/20 transition-colors cursor-pointer">
                        View all {lowStock.length} items
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">Inventory levels are healthy.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="h-[calc(100vh-14rem)] min-h-[500px] flex flex-col border-border/50 shadow-xs">
              <CardHeader className="pb-4 border-b border-border/40">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto">
                {recentSales && recentSales.length > 0 ? (
                  <div className="divide-y divide-border/40">
                    {recentSales.slice(0, 12).map((sale) => (
                      <div key={sale.id} className={`px-6 py-4 hover:bg-muted/20 transition-colors ${sale.isReturned ? "opacity-60" : ""}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm text-foreground truncate">
                            {sale.model}
                            {sale.isReturned && (
                              <span className="ml-2 text-[9px] uppercase tracking-wider text-muted-foreground">Returned</span>
                            )}
                          </span>
                          <span className={`font-medium text-sm tabular-nums ml-2 ${sale.isReturned ? "text-muted-foreground line-through" : "text-primary"}`}>
                            ${sale.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {sale.quantity} × ${sale.unitPrice}
                            {sale.customerName ? ` · ${sale.customerName}` : ""}
                          </span>
                          <span>{format(new Date(sale.soldAt), "h:mm a")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">No recent activity</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}
