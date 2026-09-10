import { apiFetch } from "@/lib/api";

export type User = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  roleName: string;
};

export async function getUsers(): Promise<User[]> {
  return apiFetch<User[]>("/api/users");
}
