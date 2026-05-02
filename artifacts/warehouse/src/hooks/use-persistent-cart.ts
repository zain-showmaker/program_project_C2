import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pcwh:cart:v1";

export type CartMap = Map<number, number>;

function load(): CartMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as Array<[number, number]>;
    if (!Array.isArray(parsed)) return new Map();
    return new Map(parsed.filter((p) => Array.isArray(p) && p.length === 2 && typeof p[0] === "number" && typeof p[1] === "number" && p[1] > 0));
  } catch {
    return new Map();
  }
}

function persist(map: CartMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(map.entries())));
  } catch {
    // ignore quota errors
  }
}

export function usePersistentCart() {
  const [cart, setCart] = useState<CartMap>(() => load());

  useEffect(() => {
    persist(cart);
  }, [cart]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setCart(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setQty = useCallback((id: number, qty: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      if (qty <= 0) next.delete(id);
      else next.set(id, qty);
      return next;
    });
  }, []);

  const clear = useCallback(() => setCart(new Map()), []);

  return { cart, setCart, setQty, clear };
}
