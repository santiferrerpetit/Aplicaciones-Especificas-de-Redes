import { useCallback, useEffect, useState } from "react";
import {
  createInventory,
  createInventoryLoan,
  deactivateInventory,
  getInventory,
  getInventoryLoans,
  returnInventoryLoan,
  updateInventory,
  type CreateInventoryInput,
  type CreateLoanInput,
  type InventoryItem,
  type InventoryLoan,
  type UpdateInventoryInput,
} from "../api/inventoryApi";

export function useInventory(includeInactive = false) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loans, setLoans] = useState<InventoryLoan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [nextItems, nextLoans] = await Promise.all([
        getInventory({ includeInactive }),
        getInventoryLoans(),
      ]);
      setItems(nextItems);
      setLoans(nextLoans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el inventario");
    } finally {
      setIsLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addItem = async (data: CreateInventoryInput) => {
    try {
      const item = await createInventory(data);
      await refresh();
      return item;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el material");
      return null;
    }
  };

  const editItem = async (id: number, data: UpdateInventoryInput) => {
    try {
      const item = await updateInventory(id, data);
      await refresh();
      return item;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el material");
      return null;
    }
  };

  const deactivateItem = async (id: number) => {
    try {
      await deactivateInventory(id);
      await refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo desactivar el material");
      return false;
    }
  };

  const loanItem = async (itemId: number, data: CreateLoanInput) => {
    try {
      await createInventoryLoan(itemId, data);
      await refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el préstamo");
      return false;
    }
  };

  const returnLoan = async (id: number) => {
    try {
      await returnInventoryLoan(id);
      await refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la devolución");
      return false;
    }
  };

  return { items, loans, isLoading, error, refresh, addItem, editItem, deactivateItem, loanItem, returnLoan };
}
