import { apiFetch } from "@/lib/api";
import type { Facility } from "@/features/reservations/api/reservationsApi";

export type MaintenanceStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED";
export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type MaintenanceLog = {
  id: number;
  facilityId: number;
  facility: Facility;
  userId: number;
  user: { id: number; firstName: string; lastName: string; username: string };
  date: string;
  taskDescription: string;
  suppliesNeeded: string | null;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateFacilityInput = {
  name: string;
  description?: string;
  reservable: boolean;
};

export type CreateMaintenanceInput = {
  facilityId: number;
  taskDescription: string;
  suppliesNeeded?: string;
  priority: MaintenancePriority;
};

export async function getFacilities() {
  return apiFetch<Facility[]>("/api/maintenance/facilities?includeInactive=true");
}

export async function createFacility(data: CreateFacilityInput) {
  return apiFetch<Facility>("/api/maintenance/facilities", { method: "POST", body: JSON.stringify(data) });
}

export async function updateFacility(id: number, data: Partial<CreateFacilityInput> & { active?: boolean }) {
  return apiFetch<Facility>(`/api/maintenance/facilities/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deactivateFacility(id: number) {
  return apiFetch<Facility>(`/api/maintenance/facilities/${id}/deactivate`, { method: "PATCH" });
}

export async function getMaintenanceLogs(filters: { status?: MaintenanceStatus; priority?: MaintenancePriority }) {
  const query = new URLSearchParams();
  if (filters.status) query.set("status", filters.status);
  if (filters.priority) query.set("priority", filters.priority);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<MaintenanceLog[]>(`/api/maintenance${suffix}`);
}

export async function createMaintenanceLog(data: CreateMaintenanceInput) {
  return apiFetch<MaintenanceLog>("/api/maintenance", { method: "POST", body: JSON.stringify(data) });
}

export async function updateMaintenanceLog(id: number, data: Partial<CreateMaintenanceInput>) {
  return apiFetch<MaintenanceLog>(`/api/maintenance/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function updateMaintenanceStatus(id: number, status: MaintenanceStatus) {
  return apiFetch<MaintenanceLog>(`/api/maintenance/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteMaintenanceLog(id: number) {
  return apiFetch<void>(`/api/maintenance/${id}`, { method: "DELETE" });
}
