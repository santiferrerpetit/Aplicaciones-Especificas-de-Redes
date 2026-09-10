import { z } from "zod";

export const createSalarySchema = z.object({
  userId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
  paymentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha de pago inválida",
  }),
  receipt: z.string().optional(),
});

export const updateSalarySchema = z.object({
  amount: z.coerce.number().positive().optional(),
  paymentDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Fecha de pago inválida" })
    .optional(),
  receipt: z.string().optional(),
});

export const salaryIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateSalaryInput = z.infer<typeof createSalarySchema>;
export type UpdateSalaryInput = z.infer<typeof updateSalarySchema>;
