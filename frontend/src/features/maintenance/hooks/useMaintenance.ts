import { useCallback, useEffect, useState } from "react";
import {
  createFacility,
  createMaintenanceLog,
  deactivateFacility,
  deleteMaintenanceLog,
  getFacilities,
  getMaintenanceLogs,
  updateMaintenanceLog,
  updateMaintenanceStatus,
  type CreateFacilityInput,
  type CreateMaintenanceInput,
  type MaintenanceLog,
  type MaintenancePriority,
  type MaintenanceStatus,
} from "../api/maintenanceApi";
import type { Facility } from "@/features/reservations/api/reservationsApi";

export function useMaintenance(filters: { status?: MaintenanceStatus; priority?: MaintenancePriority }) {
  const { status, priority } = filters;
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [nextFacilities, nextLogs] = await Promise.all([
        getFacilities(),
        getMaintenanceLogs({ status, priority }),
      ]);
      setFacilities(nextFacilities);
      setLogs(nextLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar mantenimiento");
    } finally {
      setIsLoading(false);
    }
  }, [priority, status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addFacility = async (data: CreateFacilityInput) => {
    try {
      const facility = await createFacility(data);
      await refresh();
      return facility;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la instalación");
      return null;
    }
  };

  const addLog = async (data: CreateMaintenanceInput) => {
    try {
      const log = await createMaintenanceLog(data);
      await refresh();
      return log;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el mantenimiento");
      return null;
    }
  };

  const editLog = async (id: number, data: Partial<CreateMaintenanceInput>) => {
    try {
      const log = await updateMaintenanceLog(id, data);
      await refresh();
      return log;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el mantenimiento");
      return null;
    }
  };

  const changeStatus = async (id: number, status: MaintenanceStatus) => {
    try {
      const log = await updateMaintenanceStatus(id, status);
      await refresh();
      return log;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el estado");
      return null;
    }
  };

  const removeLog = async (id: number) => {
    try {
      await deleteMaintenanceLog(id);
      await refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el registro");
      return false;
    }
  };

  const disableFacility = async (id: number) => {
    try {
      await deactivateFacility(id);
      await refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo desactivar la instalación");
      return false;
    }
  };

  return { facilities, logs, isLoading, error, refresh, addFacility, addLog, editLog, changeStatus, removeLog, disableFacility };
}
