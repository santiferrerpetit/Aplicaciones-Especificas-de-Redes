import { z } from "zod";

export const maintenanceStatus = z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CANCELLED"]);
export const maintenancePriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const facilityIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const maintenanceIdSchema = facilityIdSchema;

export const facilityQuerySchema = z.object({
  includeInactive: z.coerce.boolean().default(false),
  reservableOnly: z.coerce.boolean().default(false),
});

export const createFacilitySchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  reservable: z.coerce.boolean().default(false),
});

export const updateFacilitySchema = createFacilitySchema
  .partial()
  .extend({ active: z.coerce.boolean().optional() });

export const maintenanceQuerySchema = z.object({
  facilityId: z.coerce.number().int().positive().optional(),
  status: maintenanceStatus.optional(),
  priority: maintenancePriority.optional(),
});

export const createMaintenanceSchema = z.object({
  facilityId: z.coerce.number().int().positive(),
  date: z.coerce.date().optional(),
  taskDescription: z.string().trim().min(1, "La descripción es requerida").max(1000),
  suppliesNeeded: z.string().trim().max(1000).optional().or(z.literal("")),
  priority: maintenancePriority.default("MEDIUM"),
});

export const updateMaintenanceSchema = z.object({
  facilityId: z.coerce.number().int().positive().optional(),
  taskDescription: z.string().trim().min(1).max(1000).optional(),
  suppliesNeeded: z.string().trim().max(1000).optional().or(z.literal("")),
  priority: maintenancePriority.optional(),
});

export const updateMaintenanceStatusSchema = z.object({
  status: maintenanceStatus,
});

export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
