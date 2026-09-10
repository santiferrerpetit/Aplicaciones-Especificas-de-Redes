import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import type { CreateReservationInput, UpdateReservationInput } from "./reservations.schema";

const isAdministrator = (roleName: string) => roleName === "Administrator";
const nullableText = (value?: string) => (value ? value : null);

async function assertAvailableFacility(facilityId: number) {
  const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
  if (!facility || !facility.active || !facility.reservable) {
    throw new AppError("La instalación no está disponible para reservas", "FACILITY_NOT_RESERVABLE", 400);
  }
  return facility;
}

async function assertNoOverlap(
  client: Prisma.TransactionClient,
  facilityId: number,
  startAt: Date,
  endAt: Date,
  ignoredId?: number,
) {
  const conflict = await client.reservation.findFirst({
    where: {
      facilityId,
      status: "CONFIRMED",
      startAt: { lt: endAt },
      endAt: { gt: startAt },
      ...(ignoredId ? { NOT: { id: ignoredId } } : {}),
    },
    select: { id: true },
  });

  if (conflict) {
    throw new AppError("La instalación ya está reservada en ese horario", "RESERVATION_CONFLICT", 409);
  }
}

export async function listReservations(filters: {
  facilityId?: number;
  from?: Date;
  to?: Date;
  status?: string;
}) {
  const where: Prisma.ReservationWhereInput = {
    ...(filters.facilityId ? { facilityId: filters.facilityId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.to ? { startAt: { lt: filters.to } } : {}),
    ...(filters.from ? { endAt: { gt: filters.from } } : {}),
  };

  return prisma.reservation.findMany({
    where,
    include: {
      facility: true,
      user: { select: { id: true, firstName: true, lastName: true, username: true } },
    },
    orderBy: { startAt: "asc" },
  });
}

export async function getReservationById(id: number) {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      facility: true,
      user: { select: { id: true, firstName: true, lastName: true, username: true } },
    },
  });
}

export async function createReservation(userId: number, data: CreateReservationInput) {
  await assertAvailableFacility(data.facilityId);

  return prisma.$transaction(async (tx) => {
    await assertNoOverlap(tx, data.facilityId, data.startAt, data.endAt);
    return tx.reservation.create({
      data: {
        facilityId: data.facilityId,
        userId,
        startAt: data.startAt,
        endAt: data.endAt,
        notes: nullableText(data.notes),
      },
      include: {
        facility: true,
        user: { select: { id: true, firstName: true, lastName: true, username: true } },
      },
    });
  });
}

export async function updateReservation(
  id: number,
  userId: number,
  roleName: string,
  data: UpdateReservationInput,
) {
  const existing = await prisma.reservation.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Reserva no encontrada", "RESERVATION_NOT_FOUND", 404);
  }
  if (!isAdministrator(roleName) && existing.userId !== userId) {
    throw new AppError("No puedes modificar una reserva de otro usuario", "FORBIDDEN", 403);
  }
  if (existing.status === "CANCELLED") {
    throw new AppError("No se puede modificar una reserva cancelada", "RESERVATION_CANCELLED", 409);
  }

  const facilityId = data.facilityId ?? existing.facilityId;
  const startAt = data.startAt ?? existing.startAt;
  const endAt = data.endAt ?? existing.endAt;
  await assertAvailableFacility(facilityId);

  return prisma.$transaction(async (tx) => {
    await assertNoOverlap(tx, facilityId, startAt, endAt, id);
    return tx.reservation.update({
      where: { id },
      data: {
        facilityId,
        startAt,
        endAt,
        ...(data.notes !== undefined ? { notes: nullableText(data.notes) } : {}),
      },
      include: {
        facility: true,
        user: { select: { id: true, firstName: true, lastName: true, username: true } },
      },
    });
  });
}

export async function cancelReservation(id: number, userId: number, roleName: string) {
  const existing = await prisma.reservation.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Reserva no encontrada", "RESERVATION_NOT_FOUND", 404);
  }
  if (!isAdministrator(roleName) && existing.userId !== userId) {
    throw new AppError("No puedes cancelar una reserva de otro usuario", "FORBIDDEN", 403);
  }
  if (existing.status === "CANCELLED") {
    return existing;
  }

  return prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: {
      facility: true,
      user: { select: { id: true, firstName: true, lastName: true, username: true } },
    },
  });
}
