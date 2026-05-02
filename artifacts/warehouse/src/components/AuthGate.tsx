import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { Box, LogIn, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center space-y-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-md">
            <Box className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">PC Warehouse Pro</h1>
            <p className="text-sm text-muted-foreground">
              Inventory, sales, and analytics for your PC parts business.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-6 space-y-5 shadow-xs">
            <p className="text-sm text-muted-foreground">
              Sign in to access your inventory, record sales, and view analytics.
            </p>
            <Button onClick={login} size="lg" className="w-full h-11" data-testid="button-login">
              <LogIn className="w-4 h-4 mr-2" />
              Log in
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground/70">
            Secured with single sign-on. Your session is private to you.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
