import { z } from "zod";

const reservationFields = {
  facilityId: z.coerce.number().int().positive("La instalación es requerida"),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
};

const validateRange = <T extends { startAt?: Date; endAt?: Date }>(value: T, ctx: z.RefinementCtx) => {
  if (value.startAt && value.endAt && value.startAt >= value.endAt) {
    ctx.addIssue({
      code: "custom",
      path: ["endAt"],
      message: "La hora de finalización debe ser posterior al inicio",
    });
  }
};

export const createReservationSchema = z.object(reservationFields).superRefine(validateRange);

export const updateReservationSchema = z
  .object({
    facilityId: reservationFields.facilityId.optional(),
    startAt: reservationFields.startAt.optional(),
    endAt: reservationFields.endAt.optional(),
    notes: reservationFields.notes,
  })
  .superRefine(validateRange);

export const reservationIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const reservationQuerySchema = z.object({
  facilityId: z.coerce.number().int().positive().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  status: z.enum(["CONFIRMED", "CANCELLED"]).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
