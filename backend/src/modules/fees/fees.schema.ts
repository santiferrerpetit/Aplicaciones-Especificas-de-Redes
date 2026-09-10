import { z } from "zod";

const categoryEnum = z.enum(["Menor", "Infantil", "Juvenil", "Adulto", "Senior"]);

export const createFeeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  category: categoryEnum,
  disciplineId: z.coerce.number().int().positive("La disciplina es requerida"),
  description: z.string().max(500).optional().or(z.literal("")),
  active: z.coerce.boolean().default(true),
});

export const updateFeeSchema = createFeeSchema.partial();

export const feeIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const memberIdSchema = z.object({
  memberId: z.coerce.number().int().positive(),
});

export const feeIdParamSchema = z.object({
  feeId: z.coerce.number().int().positive(),
});

export const assignFeeSchema = z.object({
  memberId: z.coerce.number().int().positive(),
  feeId: z.coerce.number().int().positive(),
  paid: z.coerce.boolean().default(false),
});

export const toggleFeePaidSchema = z.object({
  memberId: z.coerce.number().int().positive(),
  feeId: z.coerce.number().int().positive(),
  paid: z.coerce.boolean(),
});

export type CreateFeeInput = z.infer<typeof createFeeSchema>;
export type UpdateFeeInput = z.infer<typeof updateFeeSchema>;
export type AssignFeeInput = z.infer<typeof assignFeeSchema>;
export type ToggleFeePaidInput = z.infer<typeof toggleFeePaidSchema>;
