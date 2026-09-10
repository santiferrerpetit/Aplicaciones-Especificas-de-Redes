import { apiFetch } from "@/lib/api";

export type InventoryItem = {
  id: number;
  name: string;
  category: string | null;
  location: string | null;
  totalQuantity: number;
  availableQuantity: number;
  minimumQuantity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { loans: number };
};

export type InventoryLoan = {
  id: number;
  itemId: number;
  item: InventoryItem;
  userId: number;
  user: { id: number; firstName: string; lastName: string; username: string };
  quantity: number;
  checkoutDate: string;
  dueDate: string | null;
  returnDate: string | null;
  returned: boolean;
  notes: string | null;
};

export type CreateInventoryInput = {
  name: string;
  category?: string;
  location?: string;
  totalQuantity: number;
  minimumQuantity: number;
};

export type UpdateInventoryInput = Partial<CreateInventoryInput> & { active?: boolean };

export type CreateLoanInput = {
  quantity: number;
  dueDate?: string;
  notes?: string;
};

export async function getInventory(options: { includeInactive?: boolean; lowStock?: boolean } = {}) {
  const params = new URLSearchParams();
  if (options.includeInactive) params.set("includeInactive", "true");
  if (options.lowStock) params.set("lowStock", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<InventoryItem[]>(`/api/inventory${query}`);
}

export async function createInventory(data: CreateInventoryInput) {
  return apiFetch<InventoryItem>("/api/inventory", { method: "POST", body: JSON.stringify(data) });
}

export async function updateInventory(id: number, data: UpdateInventoryInput) {
  return apiFetch<InventoryItem>(`/api/inventory/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deactivateInventory(id: number) {
  return apiFetch<InventoryItem>(`/api/inventory/${id}`, { method: "DELETE" });
}

export async function getInventoryLoans(returned?: boolean) {
  const query = returned === undefined ? "" : `?returned=${returned}`;
  return apiFetch<InventoryLoan[]>(`/api/inventory/loans${query}`);
}

export async function createInventoryLoan(itemId: number, data: CreateLoanInput) {
  return apiFetch<InventoryLoan>(`/api/inventory/${itemId}/loans`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function returnInventoryLoan(id: number) {
  return apiFetch<InventoryLoan>(`/api/inventory/loans/${id}/return`, { method: "PATCH" });
}
