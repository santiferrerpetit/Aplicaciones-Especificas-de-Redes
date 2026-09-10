import { z } from "zod";

const categoryEnum = z.enum(["Menor", "Infantil", "Juvenil", "Adulto", "Senior"]);

export const createSocialFeeSchema = z.object({
  category: categoryEnum,
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  dueDay: z.coerce.number().int().min(1).max(31).default(10),
  active: z.coerce.boolean().default(true),
});

export const updateSocialFeeSchema = createSocialFeeSchema.partial();

export const socialFeeIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const memberIdSchema = z.object({
  memberId: z.coerce.number().int().positive(),
});

export const toggleSocialFeePaidSchema = z.object({
  memberSocialFeeId: z.coerce.number().int().positive(),
  paid: z.coerce.boolean(),
});

export const generateMonthSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
});

export type CreateSocialFeeInput = z.infer<typeof createSocialFeeSchema>;
export type UpdateSocialFeeInput = z.infer<typeof updateSocialFeeSchema>;
export type ToggleSocialFeePaidInput = z.infer<typeof toggleSocialFeePaidSchema>;
export type GenerateMonthInput = z.infer<typeof generateMonthSchema>;
