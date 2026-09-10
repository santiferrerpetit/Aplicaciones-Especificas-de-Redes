import { z } from "zod";

export const uploadParamsSchema = z.object({
  module: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z-]+$/, "Módulo inválido")
    .default("general"),
});

export const listQuerySchema = z.object({
  module: z.string().max(50).regex(/^[a-z-]+$/).optional(),
  refId: z.coerce.number().int().positive().optional(),
});

export const uploadBodySchema = z.object({
  refId: z.coerce.number().int().positive().optional(),
});

export const deleteFileSchema = z.object({
  id: z.coerce.number().int().positive(),
});
