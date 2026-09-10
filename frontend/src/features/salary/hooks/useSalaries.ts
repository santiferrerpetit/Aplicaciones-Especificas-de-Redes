import { useState, useEffect, useCallback } from "react";
import { getSalaries, createSalary, updateSalary, deleteSalary } from "../api/salaryApi";
import type { Salary, CreateSalaryInput, UpdateSalaryInput } from "../api/salaryApi";

export function useSalaries() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSalaries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSalaries();
      setSalaries(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar salarios");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  async function addSalary(data: CreateSalaryInput) {
    setError(null);
    try {
      const newSalary = await createSalary(data);
      setSalaries((prev) => [newSalary, ...prev]);
      return newSalary;
    } catch (err: any) {
      setError(err.message || "Error al crear registro salarial");
      return null;
    }
  }

  async function editSalary(id: number, data: UpdateSalaryInput) {
    setError(null);
    try {
      const updated = await updateSalary(id, data);
      setSalaries((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (err: any) {
      setError(err.message || "Error al actualizar registro salarial");
      return null;
    }
  }

  async function removeSalary(id: number) {
    setError(null);
    try {
      await deleteSalary(id);
      setSalaries((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || "Error al eliminar registro salarial");
      return false;
    }
  }

  return { salaries, isLoading, error, fetchSalaries, addSalary, editSalary, removeSalary };
}
