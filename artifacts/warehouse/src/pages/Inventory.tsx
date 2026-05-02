import { useMemo, useState } from "react";
import { Shell } from "@/components/layout/Shell";
import {
  useListComponents,
  useDeleteComponent,
  useUpdateComponent,
  useBulkDeleteComponents,
  getListComponentsQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetLowStockQueryKey,
  getGetReorderListQueryKey,
  getGetBestSellersQueryKey,
  getGetSlowMoversQueryKey,
  useListCategories,
  useGetCategorySuggestions,
  useCreateComponent,
  getListCategoriesQueryKey,
  getGetCategorySuggestionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Trash2, Minus, Image as ImageIcon, Check, X, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  category: z.string().min(1, "Category is required"),
  model: z.string().min(1, "Model is required"),
  quantity: z.coerce.number().min(0),
  price: z.coerce.number().min(0.01),
  cost: z.coerce.number().min(0).default(0),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: components, isLoading } = useListComponents({
    search: search || undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  const { data: categories } = useListCategories();
  const deleteComponent = useDeleteComponent();
  const updateComponent = useUpdateComponent();
  const bulkDelete = useBulkDeleteComponents();

  const invalidateInventory = () => {
    queryClient.invalidateQueries({ queryKey: getListComponentsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetLowStockQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetReorderListQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetBestSellersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetSlowMoversQueryKey() });
  };

  const handleDelete = (id: number, model: string) => {
    const snapshot = components?.find((c) => c.id === id);
    deleteComponent.mutate(
      { id },
      {
        onSuccess: () => {
          invalidateInventory();
          toast({
            title: "Item deleted",
            description: `${model} has been removed.`,
            action: snapshot ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // re-create as undo
                  fetch(`${import.meta.env.BASE_URL}api/components`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      category: snapshot.category,
                      model: snapshot.model,
                      quantity: snapshot.quantity,
                      price: snapshot.price,
                      cost: snapshot.cost,
                      imageUrl: snapshot.imageUrl ?? undefined,
                    }),
                  }).then(() => invalidateInventory());
                }}
              >
                Undo
              </Button>
            ) : undefined,
          });
        },
      },
    );
  };

  const handleAdjust = (id: number, currentQuantity: number, delta: 1 | -1) => {
    if (currentQuantity + delta < 0) return;
    updateComponent.mutate(
      { id, data: { addQuantity: delta } },
      { onSuccess: () => invalidateInventory() },
    );
  };

  const filteredIds = useMemo(() => (components ?? []).map((c) => c.id), [components]);
  const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (filteredIds.every((id) => prev.has(id))) {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.delete(id));
        return next;
      }
      const next = new Set(prev);
      filteredIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    bulkDelete.mutate(
      { data: { ids } },
      {
        onSuccess: (res) => {
          invalidateInventory();
          toast({
            title: "Bulk delete complete",
            description: `${res.deleted} item${res.deleted === 1 ? "" : "s"} removed from inventory.`,
          });
          exitSelectMode();
        },
      },
    );
  };

  return (
    <Shell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Inventory</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage components, pricing, and stock levels.</p>
          </div>
          <div className="flex items-center gap-2">
            {!selectMode ? (
              <>
                <Button
                  variant="outline"
                  className="h-10 border-border/50"
                  onClick={() => setSelectMode(true)}
                  data-testid="button-select-mode"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Select
                </Button>
                <SmartAddDialog open={isAddOpen} onOpenChange={setIsAddOpen} categories={categories || []} />
              </>
            ) : (
              <>
                <span className="text-xs text-muted-foreground tabular-nums px-2" data-testid="text-selected-count">
                  {selected.size} selected
                </span>
                <Button variant="outline" className="h-10 border-border/50" onClick={toggleSelectAll}>
                  {allSelected ? "Unselect all" : "Select all"}
                </Button>
                <Button
                  variant="destructive"
                  className="h-10"
                  disabled={selected.size === 0 || bulkDelete.isPending}
                  onClick={handleBulkDelete}
                  data-testid="button-bulk-delete"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selected.size > 0 ? `(${selected.size})` : ""}
                </Button>
                <Button variant="ghost" className="h-10" onClick={exitSelectMode}>
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 border-border/50 bg-card shadow-xs focus-visible:ring-1"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-10 border-border/50 bg-card shadow-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="aspect-square rounded-xl border border-border/50 bg-card animate-pulse" />
              ))}
          </div>
        ) : components?.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card py-20 text-center text-sm text-muted-foreground">
            No components found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {components?.map((component) => {
              const isLowStock = component.quantity < 3;
              const isOutOfStock = component.quantity === 0;
              const isSelected = selected.has(component.id);
              return (
                <div
                  key={component.id}
                  data-testid={`card-component-${component.id}`}
                  onClick={selectMode ? () => toggleSelect(component.id) : undefined}
                  className={`relative aspect-square rounded-xl border bg-card p-5 flex flex-col justify-between transition-colors overflow-hidden ${
                    selectMode
                      ? isSelected
                        ? "border-primary ring-2 ring-primary/30 cursor-pointer"
                        : "border-border/50 hover:border-border cursor-pointer"
                      : "border-border/50 hover:border-border"
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

                  {selectMode && (
                    <div className="absolute top-3 left-3 z-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(component.id)}
                        data-testid={`checkbox-component-${component.id}`}
                      />
                    </div>
                  )}

                  <div className="space-y-3 relative z-[1]">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-wider ${selectMode ? "ml-7" : ""}`}>
                        {component.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {component.imageUrl && <ImageIcon className="w-3 h-3 text-muted-foreground/60" />}
                        <span className="font-mono text-[10px] text-muted-foreground">#{component.id}</span>
                      </div>
                    </div>

                    {component.imageUrl && (
                      <div className="relative h-16 -mx-2 -mt-1 rounded-md overflow-hidden">
                        <img
                          src={component.imageUrl}
                          alt={component.model}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget.parentElement as HTMLDivElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}

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
                        <div className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
                          cost ${component.cost.toFixed(0)} · {component.marginPct.toFixed(0)}% margin
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

                  {!selectMode && (
                    <div className="grid grid-cols-3 gap-2 pt-4 relative z-[1]">
                      <Button
                        data-testid={`button-decrease-${component.id}`}
                        onClick={() => handleAdjust(component.id, component.quantity, -1)}
                        disabled={isOutOfStock || updateComponent.isPending}
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs font-medium border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                      >
                        <Minus className="w-3.5 h-3.5 mr-1" />
                        Decrease
                      </Button>
                      <Button
                        data-testid={`button-increase-${component.id}`}
                        onClick={() => handleAdjust(component.id, component.quantity, 1)}
                        disabled={updateComponent.isPending}
                        size="sm"
                        className="h-9 text-xs font-medium"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Increase
                      </Button>
                      <Button
                        data-testid={`button-delete-${component.id}`}
                        onClick={() => handleDelete(component.id, component.model)}
                        disabled={deleteComponent.isPending}
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs font-medium border-border/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}

                  {selectMode && isSelected && (
                    <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}

function SmartAddDialog({ open, onOpenChange, categories }: { open: boolean; onOpenChange: (open: boolean) => void; categories: string[] }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      model: "",
      quantity: 1,
      price: 0,
      cost: 0,
      imageUrl: "",
    },
  });

  const watchCategory = form.watch("category");
  const watchPrice = form.watch("price");
  const watchCost = form.watch("cost");
  const previewMargin = watchPrice > 0 ? Math.max(0, ((watchPrice - watchCost) / watchPrice) * 100) : 0;

  const { data: suggestions } = useGetCategorySuggestions(watchCategory, {
    query: {
      enabled: !!watchCategory && watchCategory.length > 2,
      queryKey: getGetCategorySuggestionsQueryKey(watchCategory),
    },
  });

  const createComponent = useCreateComponent();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createComponent.mutate(
      {
        data: {
          category: values.category,
          model: values.model,
          quantity: values.quantity,
          price: values.price,
          cost: values.cost > 0 ? values.cost : undefined,
          imageUrl: values.imageUrl?.trim() ? values.imageUrl.trim() : undefined,
        },
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListComponentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({
            title: "Item added",
            description: `${data.model} has been added to inventory.`,
          });
          onOpenChange(false);
          form.reset();
        },
        onError: () => {
          toast({
            title: "Error",
            description: "There was a problem saving to the database.",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="shadow-xs">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px] p-6 border-border/50 shadow-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-medium">Add New Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-muted-foreground">Category</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input placeholder="Type category..." {...field} className="h-9 border-border/50" />
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-[120px] h-9 border-border/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-muted-foreground">Model</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ryzen 9 7950X" {...field} className="h-9 border-border/50" />
                  </FormControl>
                  {suggestions && suggestions.length > 0 && (
                    <div className="mt-2 py-2 bg-muted/30 rounded-md border border-border/50 flex flex-col max-h-40 overflow-y-auto">
                      <div className="text-[10px] uppercase font-medium text-muted-foreground px-3 mb-1 tracking-wider">Suggestions</div>
                      {suggestions.map((s) => (
                        <div
                          key={s.model}
                          className="flex justify-between items-center text-sm px-3 py-1.5 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => {
                            form.setValue("model", s.model);
                            form.setValue("price", s.approxPrice);
                            form.setValue("cost", s.approxCost);
                          }}
                        >
                          <span className="font-medium text-foreground">{s.model}</span>
                          <div className="text-muted-foreground text-xs tabular-nums">
                            ${s.approxPrice} <span className="opacity-60">/ ${s.approxCost}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-muted-foreground">Stock</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} className="h-9 border-border/50" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-muted-foreground">Sell ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min={0} {...field} className="h-9 border-border/50" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-muted-foreground">Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min={0} {...field} className="h-9 border-border/50" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {watchPrice > 0 && (
              <div className="text-xs text-muted-foreground tabular-nums -mt-2">
                Margin preview: <span className="font-semibold text-foreground">{previewMargin.toFixed(1)}%</span>{" "}
                · profit/unit ${(watchPrice - watchCost).toFixed(2)}
              </div>
            )}

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-muted-foreground">Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} className="h-9 border-border/50" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-2" disabled={createComponent.isPending}>
              {createComponent.isPending ? "Adding..." : "Add to Inventory"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
