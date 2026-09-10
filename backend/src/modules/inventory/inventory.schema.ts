import { z } from "zod";

export const inventoryIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const loanIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createInventorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(120),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  totalQuantity: z.coerce.number().int().nonnegative("La cantidad no puede ser negativa"),
  minimumQuantity: z.coerce.number().int().nonnegative().default(0),
});

export const updateInventorySchema = createInventorySchema
  .partial()
  .extend({ active: z.coerce.boolean().optional() });

export const inventoryQuerySchema = z.object({
  includeInactive: z.coerce.boolean().default(false),
  lowStock: z.coerce.boolean().default(false),
});

export const createLoanSchema = z.object({
  quantity: z.coerce.number().int().positive().default(1),
  dueDate: z.coerce.date().optional(),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type CreateLoanInput = z.infer<typeof createLoanSchema>;
