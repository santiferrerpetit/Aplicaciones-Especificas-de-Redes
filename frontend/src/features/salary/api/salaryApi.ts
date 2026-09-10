import { apiFetch } from "@/lib/api";

export type Salary = {
  id: number;
  userId: number;
  amount: number;
  paymentDate: string;
  receipt: string | null;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
};

export type CreateSalaryInput = {
  userId: number;
  amount: number;
  paymentDate: string;
  receipt?: string;
};

export type UpdateSalaryInput = Partial<CreateSalaryInput>;

function parseSalary(data: any): Salary {
  return {
    ...data,
    amount: Number(data.amount),
  };
}

export async function getSalaries(): Promise<Salary[]> {
  const data = await apiFetch<any[]>("/api/salaries");
  return data.map(parseSalary);
}

export async function getSalary(id: number): Promise<Salary> {
  const data = await apiFetch<any>(`/api/salaries/${id}`);
  return parseSalary(data);
}

export async function createSalary(input: CreateSalaryInput): Promise<Salary> {
  const data = await apiFetch<any>("/api/salaries", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseSalary(data);
}

export async function updateSalary(id: number, input: UpdateSalaryInput): Promise<Salary> {
  const data = await apiFetch<any>(`/api/salaries/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return parseSalary(data);
}

export async function deleteSalary(id: number): Promise<void> {
  return apiFetch(`/api/salaries/${id}`, { method: "DELETE" });
}
