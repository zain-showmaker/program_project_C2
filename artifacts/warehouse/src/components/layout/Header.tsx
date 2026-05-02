import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Box, Search, LogOut } from "lucide-react";
import { CommandPalette } from "@/components/CommandPalette";
import { useAuth } from "@workspace/replit-auth-web";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [location] = useLocation();
  const [paletteTrigger, setPaletteTrigger] = useState(0);
  const { user, logout } = useAuth();

  const initials = user
    ? `${(user.firstName?.[0] ?? "").toUpperCase()}${(user.lastName?.[0] ?? "").toUpperCase()}` || (user.email?.[0]?.toUpperCase() ?? "U")
    : "AD";
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Account"
    : "Admin";

  const links = [
    { href: "/", label: "Overview" },
    { href: "/inventory", label: "Inventory" },
    { href: "/sales", label: "Sales" },
    { href: "/analytics", label: "Analytics" },
  ];

  const openPalette = () => {
    // synthesize cmd+k to open palette
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
    setPaletteTrigger((n) => n + 1);
  };

  return (
    <header className="sticky top-0 z-50 w-full h-[68px] bg-background border-b border-border flex items-center px-6 sm:px-8">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded flex items-center justify-center bg-primary text-primary-foreground shadow-sm">
                <Box className="w-4 h-4" />
              </div>
              <span className="font-sans font-medium text-[15px] tracking-tight text-foreground">PC Warehouse Pro</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href}>
                  <div
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${
                      isActive
                        ? "bg-secondary text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {link.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openPalette}
            data-testid="button-command-palette"
            className="hidden sm:flex items-center gap-2 h-9 pl-3 pr-2 rounded-full bg-secondary/50 hover:bg-secondary border border-border/60 transition-colors text-muted-foreground"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs">Search...</span>
            <span className="ml-3 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border/80 bg-background/60 text-[10px] font-medium text-muted-foreground tabular-nums">
              ⌘K
            </span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-testid="button-account"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-secondary/50 transition-colors cursor-pointer border border-transparent focus:outline-none"
              >
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-medium text-foreground">
                    {initials}
                  </div>
                )}
                <span className="text-sm font-medium text-foreground hidden sm:inline-block max-w-[140px] truncate">
                  {displayName}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Signed in as
                <div className="mt-1 text-sm text-foreground font-medium truncate">{user?.email ?? displayName}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="text-sm" data-testid="button-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CommandPalette key={paletteTrigger} />
    </header>
  );
}
