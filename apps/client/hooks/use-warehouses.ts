import { useState, useEffect } from "react";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";

export interface Warehouse {
  id: string;
  name: string;
  location: string | null;
}

export function useWarehouses() {
  const { get } = useAuthenticatedApi();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await get("/inventory/warehouses");
      setWarehouses(response as Warehouse[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load warehouses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  return {
    warehouses,
    loading,
    error,
    reload: loadWarehouses,
  };
}
