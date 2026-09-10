import { apiFetch } from "@/lib/api";

export type Facility = {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  reservable: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { maintenanceLogs: number; reservations: number };
};

export type Reservation = {
  id: number;
  facilityId: number;
  facility: Facility;
  userId: number;
  user: { id: number; firstName: string; lastName: string; username: string };
  startAt: string;
  endAt: string;
  status: "CONFIRMED" | "CANCELLED";
  notes: string | null;
};

export type CreateReservationInput = {
  facilityId: number;
  startAt: string;
  endAt: string;
  notes?: string;
};

export async function getReservations(params: { from: string; to: string }) {
  const query = new URLSearchParams({ from: params.from, to: params.to });
  return apiFetch<Reservation[]>(`/api/reservations?${query.toString()}`);
}

export async function createReservation(data: CreateReservationInput) {
  return apiFetch<Reservation>("/api/reservations", { method: "POST", body: JSON.stringify(data) });
}

export async function updateReservation(id: number, data: Partial<CreateReservationInput>) {
  return apiFetch<Reservation>(`/api/reservations/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function cancelReservation(id: number) {
  return apiFetch<Reservation>(`/api/reservations/${id}/cancel`, { method: "PATCH" });
}

export async function getReservableFacilities() {
  return apiFetch<Facility[]>("/api/maintenance/facilities?reservableOnly=true");
}
