import { Header } from "./Header";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 flex flex-col w-full">
        <div className="flex-1 px-6 sm:px-8 py-8 md:py-12 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
