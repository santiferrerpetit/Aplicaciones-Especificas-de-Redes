import { z } from "zod";

export const createDisciplineSchema = z.object({
  name: z.string().min(1, "El nombre de la disciplina es requerido").max(200),
});

export const updateDisciplineSchema = createDisciplineSchema.partial();

export const disciplineIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const categoryEnum = z.enum(["Menor", "Infantil", "Juvenil", "Adulto", "Senior"]);

export const createGroupSchema = z.object({
  userId: z.coerce.number().int().positive("El profesor es requerido"),
  schedule: z.string().min(1, "El horario es requerido").max(100),
  days: z.string().min(1, "Los días de práctica son requeridos").max(100),
  category: categoryEnum.optional(),
  amount: z.coerce.number().positive().optional(),
});

export const updateGroupSchema = createGroupSchema.partial();

export const groupIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const assignMemberSchema = z.object({
  memberId: z.coerce.number().int().positive(),
});

export const memberIdParamSchema = z.object({
  memberId: z.coerce.number().int().positive(),
});

export const setupDisciplineSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  category: categoryEnum,
  schedule: z.string().min(1, "El horario es requerido").max(100),
  days: z.string().min(1, "Los días son requeridos").max(100),
  userId: z.coerce.number().int().positive("El profesor es requerido"),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
});

export type CreateDisciplineInput = z.infer<typeof createDisciplineSchema>;
export type UpdateDisciplineInput = z.infer<typeof updateDisciplineSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type AssignMemberInput = z.infer<typeof assignMemberSchema>;
export type SetupDisciplineInput = z.infer<typeof setupDisciplineSchema>;
