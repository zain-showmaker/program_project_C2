import { useMemo, useState } from "react";
import { Shell } from "@/components/layout/Shell";
import {
  useListComponents,
  useListSales,
  useRecordSale,
  useReturnSale,
  getListSalesQueryKey,
  getListComponentsQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetDailyRevenueQueryKey,
  getGetCategoryRevenueQueryKey,
  getGetLowStockQueryKey,
  getGetReorderListQueryKey,
  getGetBestSellersQueryKey,
  getGetSlowMoversQueryKey,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ShoppingCart,
  User,
  Download,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePersistentCart } from "@/hooks/use-persistent-cart";
import { downloadReceipt } from "@/lib/receipt";

export default function Sales() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [customerName, setCustomerName] = useState("");
  const { cart, setQty, clear } = usePersistentCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: components } = useListComponents({
    search: search || undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  });
  const { data: allComponents } = useListComponents();
  const { data: sales } = useListSales();
  const recordSale = useRecordSale();
  const returnSale = useReturnSale();

  const categories = useMemo(() => {
    const set = new Set<string>();
    (allComponents ?? []).forEach((c) => set.add(c.category));
    return Array.from(set).sort();
  }, [allComponents]);

  const componentsById = useMemo(() => {
    const map = new Map<number, NonNullable<typeof allComponents>[number]>();
    (allComponents ?? []).forEach((c) => map.set(c.id, c));
    return map;
  }, [allComponents]);

  const cartLines = useMemo(() => {
    const lines: { id: number; qty: number; component: NonNullable<typeof allComponents>[number] }[] = [];
    cart.forEach((qty, id) => {
      const component = componentsById.get(id);
      if (component) lines.push({ id, qty, component });
    });
    return lines;
  }, [cart, componentsById]);

  const cartItemCount = cartLines.reduce((sum, l) => sum + l.qty, 0);
  const cartTotal = cartLines.reduce((sum, l) => sum + l.qty * l.component.price, 0);

  const addToCart = (id: number, maxStock: number) => {
    const current = cart.get(id) ?? 0;
    if (current >= maxStock) {
      const comp = componentsById.get(id);
      toast({
        title: "Stock limit reached",
        description: `Only ${maxStock} unit${maxStock === 1 ? "" : "s"} of ${comp?.model ?? "this item"} available.`,
        variant: "destructive",
      });
      return;
    }
    setQty(id, current + 1);
  };

  const decrementCart = (id: number) => {
    const current = cart.get(id) ?? 0;
    setQty(id, current - 1);
  };

  const removeFromCart = (id: number) => {
    setQty(id, 0);
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListComponentsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDailyRevenueQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetCategoryRevenueQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetLowStockQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetReorderListQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetBestSellersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetSlowMoversQueryKey() });
  };

  const handleCheckout = async () => {
    if (cartLines.length === 0) return;

    for (const line of cartLines) {
      if (line.qty > line.component.quantity) {
        toast({
          title: "Insufficient stock",
          description: `${line.component.model} only has ${line.component.quantity} in stock.`,
          variant: "destructive",
        });
        return;
      }
    }

    const trimmedCustomer = customerName.trim();
    const snapshot = cartLines.map((l) => ({
      category: l.component.category,
      model: l.component.model,
      quantity: l.qty,
      unitPrice: l.component.price,
      total: l.qty * l.component.price,
    }));

    const results = await Promise.allSettled(
      cartLines.map((line) =>
        recordSale.mutateAsync({
          data: {
            componentId: line.id,
            quantity: line.qty,
            customerName: trimmedCustomer || undefined,
          },
        }),
      ),
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - succeeded;

    invalidateAll();

    if (failed === 0) {
      const receiptNumber = `R-${Date.now().toString(36).toUpperCase()}`;
      toast({
        title: "Purchase complete",
        description: `${succeeded} item${succeeded === 1 ? "" : "s"} sold for $${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
        action: (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              downloadReceipt({
                receiptNumber,
                soldAt: new Date(),
                customerName: trimmedCustomer || null,
                lines: snapshot,
              })
            }
          >
            <Download className="w-3 h-3 mr-1" /> Receipt
          </Button>
        ),
      });
      clear();
      setCustomerName("");
    } else {
      toast({
        title: "Partial checkout",
        description: `${succeeded} succeeded, ${failed} failed. Please review your cart.`,
        variant: "destructive",
      });
    }
  };

  const handleReturn = (saleId: number, model: string) => {
    if (!confirm(`Return "${model}"? Stock will be restocked and the sale marked as returned.`)) return;
    returnSale.mutate(
      { id: saleId },
      {
        onSuccess: () => {
          invalidateAll();
          toast({ title: "Return processed", description: `${model} restocked.` });
        },
        onError: () => {
          toast({ title: "Return failed", description: "Unable to process return.", variant: "destructive" });
        },
      },
    );
  };

  const downloadSaleReceipt = (sale: NonNullable<typeof sales>[number]) => {
    downloadReceipt({
      receiptNumber: `R-${sale.id}`,
      soldAt: sale.soldAt,
      customerName: sale.customerName,
      lines: [
        {
          category: sale.category,
          model: sale.model,
          quantity: sale.quantity,
          unitPrice: sale.unitPrice,
          total: sale.total,
        },
      ],
    });
  };

  const totalSalesRevenue = sales?.filter((s) => !s.isReturned).reduce((sum, s) => sum + s.total, 0) ?? 0;

  return (
    <Shell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sales</h1>
            <p className="text-muted-foreground mt-1 text-sm">Build a cart, add a customer, and check out to record the sale.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Customer name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-11 w-[220px] pl-9 border-border/50 bg-card text-sm"
                data-testid="input-customer-name"
              />
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Cart Total</div>
              <div className="text-lg font-semibold text-foreground tabular-nums leading-tight">
                ${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <Button
              data-testid="button-checkout"
              onClick={handleCheckout}
              disabled={cartLines.length === 0 || recordSale.isPending}
              className="h-11 px-5 text-sm font-medium shadow-xs"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {recordSale.isPending
                ? "Processing..."
                : `Complete Purchase${cartItemCount > 0 ? ` (${cartItemCount})` : ""}`}
            </Button>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-3.5 h-3.5 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Your Cart</h2>
              <span className="text-xs text-muted-foreground tabular-nums">
                {cartLines.length} item{cartLines.length === 1 ? "" : "s"}
              </span>
              {cart.size > 0 && (
                <span className="text-[10px] text-muted-foreground/60">· saved locally</span>
              )}
            </div>
            {cartLines.length > 0 && (
              <button
                onClick={clear}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                data-testid="button-clear-cart"
              >
                Clear cart
              </button>
            )}
          </div>

          {cartLines.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 bg-card/50 py-12 text-center">
              <div className="inline-flex w-10 h-10 rounded-full bg-muted/40 items-center justify-center mb-2">
                <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-foreground font-medium">Your cart is empty</p>
              <p className="text-xs text-muted-foreground mt-1">Add items from below to start a transaction.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {cartLines.map((line) => {
                const lineTotal = line.qty * line.component.price;
                const overStock = line.qty > line.component.quantity;
                return (
                  <div
                    key={line.id}
                    data-testid={`card-cart-${line.id}`}
                    className={`aspect-square rounded-xl border bg-card p-5 flex flex-col justify-between transition-colors ${
                      overStock ? "border-destructive/50" : "border-primary/30 hover:border-primary/50"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-medium uppercase tracking-wider">
                          {line.component.category}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">#{line.id}</span>
                      </div>

                      <h3 className="font-semibold text-base leading-snug text-foreground line-clamp-2">
                        {line.component.model}
                      </h3>

                      <div className="flex items-end justify-between pt-1">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Unit</div>
                          <div className="text-sm font-medium text-muted-foreground tabular-nums">
                            ${line.component.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Line Total</div>
                          <div className="text-xl font-semibold text-primary tabular-nums">
                            ${lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      {overStock && (
                        <div className="text-[11px] text-destructive">Exceeds available stock ({line.component.quantity})</div>
                      )}
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-1.5 pt-4 items-center">
                      <Button
                        data-testid={`button-cart-decrease-${line.id}`}
                        onClick={() => decrementCart(line.id)}
                        variant="outline"
                        size="sm"
                        className="h-9 px-0 text-xs font-medium border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <div className="text-sm font-semibold text-foreground tabular-nums w-8 text-center" data-testid={`text-cart-qty-${line.id}`}>
                        {line.qty}
                      </div>
                      <Button
                        data-testid={`button-cart-increase-${line.id}`}
                        onClick={() => addToCart(line.id, line.component.quantity)}
                        size="sm"
                        className="h-9 px-0 text-xs font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        data-testid={`button-cart-delete-${line.id}`}
                        onClick={() => removeFromCart(line.id)}
                        variant="outline"
                        size="sm"
                        className="h-9 px-0 text-xs font-medium border-border/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Available Items</h2>
            <span className="text-xs text-muted-foreground tabular-nums">{components?.length ?? 0} in catalog</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search components..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 border-border/50 bg-card shadow-xs focus-visible:ring-1"
                data-testid="input-sales-search"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-10 border-border/50 bg-card shadow-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!components ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl border border-border/50 bg-card animate-pulse" />
                ))}
            </div>
          ) : components.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-card py-16 text-center text-sm text-muted-foreground">
              No components found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {components.map((component) => {
                const isLowStock = component.quantity < 3;
                const isOutOfStock = component.quantity === 0;
                const inCart = cart.get(component.id) ?? 0;
                const remaining = component.quantity - inCart;
                return (
                  <div
                    key={component.id}
                    data-testid={`card-available-${component.id}`}
                    className={`relative aspect-square rounded-xl border bg-card p-5 flex flex-col justify-between transition-colors overflow-hidden ${
                      inCart > 0 ? "border-primary/40" : "border-border/50 hover:border-border"
                    }`}
                  >
                    {component.imageUrl && (
                      <img
                        src={component.imageUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <div className="space-y-3 relative z-[1]">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-wider">
                          {component.category}
                        </span>
                        {inCart > 0 ? (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold tabular-nums"
                            data-testid={`badge-in-cart-${component.id}`}
                          >
                            {inCart} in cart
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-muted-foreground">#{component.id}</span>
                        )}
                      </div>

                      <div className="flex items-start gap-1.5">
                        <h3 className="font-semibold text-base leading-snug text-foreground line-clamp-2">
                          {component.model}
                        </h3>
                        {isLowStock && (
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" title="Low stock" />
                        )}
                      </div>

                      <div className="flex items-end justify-between pt-1">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Price</div>
                          <div className="text-xl font-semibold text-foreground tabular-nums">
                            ${component.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Stock</div>
                          <div className={`text-xl font-semibold tabular-nums ${isLowStock ? "text-destructive" : "text-foreground"}`}>
                            {component.quantity}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-4 relative z-[1]">
                      <Button
                        data-testid={`button-available-decrease-${component.id}`}
                        onClick={() => decrementCart(component.id)}
                        disabled={inCart === 0}
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs font-medium border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                      >
                        <Minus className="w-3.5 h-3.5 mr-1" />
                        Decrease
                      </Button>
                      <Button
                        data-testid={`button-available-increase-${component.id}`}
                        onClick={() => addToCart(component.id, component.quantity)}
                        disabled={isOutOfStock || remaining <= 0}
                        size="sm"
                        className="h-9 text-xs font-medium"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Increase
                      </Button>
                      <Button
                        data-testid={`button-available-delete-${component.id}`}
                        onClick={() => removeFromCart(component.id)}
                        disabled={inCart === 0}
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs font-medium border-border/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4 pt-2">
          <div className="flex items-end justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Transactions</h2>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Net Revenue</div>
              <div className="text-sm font-semibold text-foreground tabular-nums">
                ${totalSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            {!sales || sales.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">No sales recorded yet.</div>
            ) : (
              <div className="divide-y divide-border/40">
                {sales.slice(0, 12).map((sale) => (
                  <div
                    key={sale.id}
                    data-testid={`row-sale-${sale.id}`}
                    className={`px-5 py-3 flex items-center gap-4 hover:bg-primary/[0.04] transition-colors ${sale.isReturned ? "opacity-60" : ""}`}
                  >
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${
                        sale.isReturned ? "bg-muted/40 border-border/40" : "bg-primary/10 border-primary/15"
                      }`}
                    >
                      {sale.isReturned ? (
                        <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <span className="text-[10px] font-semibold text-primary tracking-wide">{sale.category.slice(0, 3).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate flex items-center gap-2">
                        {sale.model}
                        {sale.isReturned && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted/60 text-muted-foreground uppercase tracking-wider">
                            Returned
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums mt-0.5 flex items-center gap-2">
                        <span>
                          {sale.quantity} × ${sale.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {sale.customerName && (
                          <>
                            <span className="text-border">•</span>
                            <span className="inline-flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {sale.customerName}
                            </span>
                          </>
                        )}
                        {sale.profit !== undefined && !sale.isReturned && (
                          <>
                            <span className="text-border">•</span>
                            <span className="text-emerald-500/80">
                              <CheckCircle2 className="w-3 h-3 inline mr-0.5" />+${sale.profit.toFixed(0)} profit
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 text-right mr-1">
                        <div className={`text-sm font-semibold tabular-nums ${sale.isReturned ? "text-muted-foreground line-through" : "text-primary"}`}>
                          {sale.isReturned ? "-" : "+"}${sale.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                          {new Date(sale.soldAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                        title="Download receipt"
                        onClick={() => downloadSaleReceipt(sale)}
                        data-testid={`button-receipt-${sale.id}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      {!sale.isReturned && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Process return"
                          disabled={returnSale.isPending}
                          onClick={() => handleReturn(sale.id, sale.model)}
                          data-testid={`button-return-${sale.id}`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Shell>
  );
}
