import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Box } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/sales", label: "Sales", icon: ShoppingCart },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-background border-r border-border text-foreground flex flex-col z-20">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-primary/10">
            <Box className="w-4 h-4 text-primary" />
          </div>
          <span className="font-sans font-semibold text-sm tracking-tight">PC Warehouse Pro</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-4 px-2 mt-2">Menu</div>
        {links.map((link) => {
          const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm ${
                  isActive
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-secondary-foreground">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">Admin</span>
            <span className="text-xs text-muted-foreground mt-1">Logged in</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
