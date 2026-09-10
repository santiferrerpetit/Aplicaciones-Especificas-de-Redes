import { apiFetch } from "@/lib/api";

export type SportsFee = {
  id: number;
  name: string;
  amount: number;
  category: string;
  active: boolean;
};

export type Discipline = {
  id: number;
  name: string;
  groupClasses: Group[];
  sportsFees: SportsFee[];
};

export type Group = {
  id: number;
  disciplineId: number;
  userId: number;
  schedule: string;
  days: string;
  user: { id: number; firstName: string; lastName: string };
  _count?: { memberGroups: number };
};

export type GroupDetail = {
  id: number;
  disciplineId: number;
  userId: number;
  schedule: string;
  days: string;
  discipline: { id: number; name: string; sportsFees: SportsFee[] };
  user: { id: number; firstName: string; lastName: string };
  memberGroups: { id: number; member: { id: number; firstName: string; lastName: string; dni: string; birthDate: string; isActive: boolean } }[];
  attendances: any[];
};

export type CreateDisciplineInput = {
  name: string;
};

export type SetupDisciplineInput = {
  name: string;
  category: string;
  schedule: string;
  days: string;
  userId: number;
  amount: number;
};

export type UpdateDisciplineInput = Partial<CreateDisciplineInput>;

export type CreateGroupInput = {
  userId: number;
  schedule: string;
  days: string;
  category?: string;
  amount?: number;
};

export type UpdateGroupInput = Partial<CreateGroupInput>;

export type AssignMemberInput = {
  memberId: number;
};

export type CreateDisciplineFeeInput = {
  name: string;
  amount: number;
  category: string;
  description?: string;
};

export type UpdateDisciplineFeeInput = Partial<CreateDisciplineFeeInput>;

export async function getDisciplines(): Promise<Discipline[]> {
  return apiFetch<Discipline[]>("/api/disciplines");
}

export async function getDiscipline(id: number): Promise<Discipline> {
  return apiFetch<Discipline>(`/api/disciplines/${id}`);
}

export async function createDiscipline(data: CreateDisciplineInput): Promise<Discipline> {
  return apiFetch<Discipline>("/api/disciplines", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function setupDiscipline(data: SetupDisciplineInput): Promise<{ discipline: Discipline; group: Group; fee: SportsFee }> {
  return apiFetch("/api/disciplines/setup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDiscipline(id: number, data: UpdateDisciplineInput): Promise<Discipline> {
  return apiFetch<Discipline>(`/api/disciplines/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDiscipline(id: number): Promise<void> {
  return apiFetch(`/api/disciplines/${id}`, {
    method: "DELETE",
  });
}

export async function getGroupsByDiscipline(disciplineId: number): Promise<Group[]> {
  return apiFetch<Group[]>(`/api/disciplines/${disciplineId}/groups`);
}

export async function createGroup(disciplineId: number, data: CreateGroupInput): Promise<Group> {
  return apiFetch<Group>(`/api/disciplines/${disciplineId}/groups`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getGroup(id: number): Promise<GroupDetail> {
  return apiFetch<GroupDetail>(`/api/disciplines/groups/${id}`);
}

export async function updateGroup(id: number, data: UpdateGroupInput): Promise<Group> {
  return apiFetch<Group>(`/api/disciplines/groups/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteGroup(id: number): Promise<void> {
  return apiFetch(`/api/disciplines/groups/${id}`, {
    method: "DELETE",
  });
}

export async function assignMemberToGroup(groupId: number, data: AssignMemberInput): Promise<any> {
  return apiFetch(`/api/disciplines/groups/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function removeMemberFromGroup(groupId: number, memberId: number): Promise<void> {
  return apiFetch(`/api/disciplines/groups/${groupId}/members/${memberId}`, {
    method: "DELETE",
  });
}

export async function getTeacherGroups(): Promise<Group[]> {
  return apiFetch<Group[]>("/api/disciplines/groups/teacher/me");
}

export type Teacher = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export async function getTeachers(): Promise<Teacher[]> {
  return apiFetch<Teacher[]>("/api/disciplines/teachers");
}

// --- Fees de disciplina ---

export async function getDisciplineFees(disciplineId: number): Promise<SportsFee[]> {
  return apiFetch<SportsFee[]>(`/api/disciplines/${disciplineId}/fees`);
}

export async function createDisciplineFee(disciplineId: number, data: CreateDisciplineFeeInput): Promise<SportsFee> {
  return apiFetch<SportsFee>(`/api/disciplines/${disciplineId}/fees`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDisciplineFee(disciplineId: number, feeId: number, data: UpdateDisciplineFeeInput): Promise<SportsFee> {
  return apiFetch<SportsFee>(`/api/disciplines/${disciplineId}/fees/${feeId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDisciplineFee(disciplineId: number, feeId: number): Promise<void> {
  return apiFetch(`/api/disciplines/${disciplineId}/fees/${feeId}`, {
    method: "DELETE",
  });
}
