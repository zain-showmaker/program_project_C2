import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useListComponents } from "@workspace/api-client-react";
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Plus, Search, AlertTriangle, RotateCcw } from "lucide-react";

export function CommandPalette({
  onAddItem,
}: {
  onAddItem?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const { data: components } = useListComponents();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command, search components, or jump to a page..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/inventory")}>
            <Package className="mr-2 h-4 w-4" />
            <span>Inventory</span>
            <CommandShortcut>G I</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/sales")}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>Sales</span>
            <CommandShortcut>G S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/analytics")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
            <CommandShortcut>G A</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {onAddItem && (
            <CommandItem
              onSelect={() => {
                setOpen(false);
                onAddItem();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Add new component</span>
            </CommandItem>
          )}
          <CommandItem onSelect={() => go("/inventory")}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search inventory</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/analytics")}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>View reorder list</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/sales")}>
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Process a return</span>
          </CommandItem>
        </CommandGroup>

        {components && components.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Components">
              {components.slice(0, 30).map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.category} ${c.model} #${c.id}`}
                  onSelect={() => go("/inventory")}
                >
                  <Package className="mr-2 h-4 w-4 opacity-60" />
                  <div className="flex-1 min-w-0 truncate">
                    <span className="font-medium">{c.model}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{c.category}</span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums ml-2">
                    {c.quantity} • ${c.price.toFixed(0)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
      <div className="hidden">{base}</div>
    </CommandDialog>
  );
}
