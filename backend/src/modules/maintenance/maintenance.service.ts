import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import type {
  CreateFacilityInput,
  CreateMaintenanceInput,
  UpdateFacilityInput,
  UpdateMaintenanceInput,
} from "./maintenance.schema";

const nullableText = (value?: string) => (value ? value : null);

async function assertFacilityExists(facilityId: number) {
  const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
  if (!facility) {
    throw new AppError("Instalación no encontrada", "FACILITY_NOT_FOUND", 404);
  }
  return facility;
}

export async function getFacilities(includeInactive = false, reservableOnly = false) {
  return prisma.facility.findMany({
    where: {
      ...(includeInactive ? {} : { active: true }),
      ...(reservableOnly ? { reservable: true } : {}),
    },
    include: {
      _count: { select: { maintenanceLogs: true, reservations: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createFacility(data: CreateFacilityInput) {
  return prisma.facility.create({
    data: {
      name: data.name,
      description: nullableText(data.description),
      reservable: data.reservable,
    },
  });
}

export async function updateFacility(id: number, data: UpdateFacilityInput) {
  await assertFacilityExists(id);

  return prisma.facility.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: nullableText(data.description) } : {}),
      ...(data.reservable !== undefined ? { reservable: data.reservable } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
    },
  });
}

export async function deactivateFacility(id: number) {
  const facility = await assertFacilityExists(id);
  const futureReservations = await prisma.reservation.count({
    where: {
      facilityId: id,
      status: "CONFIRMED",
      startAt: { gte: new Date() },
    },
  });
  if (futureReservations > 0) {
    throw new AppError("No se puede desactivar una instalación con reservas futuras", "FUTURE_RESERVATIONS", 409);
  }

  return prisma.facility.update({
    where: { id: facility.id },
    data: { active: false, reservable: false },
  });
}

export async function listMaintenanceLogs(filters: {
  facilityId?: number;
  status?: string;
  priority?: string;
}) {
  const where: Prisma.MaintenanceLogWhereInput = {
    ...(filters.facilityId ? { facilityId: filters.facilityId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
  };

  return prisma.maintenanceLog.findMany({
    where,
    include: {
      facility: true,
      user: { select: { id: true, firstName: true, lastName: true, username: true } },
    },
    orderBy: [{ status: "asc" }, { date: "desc" }],
  });
}

export async function getMaintenanceLogById(id: number) {
  return prisma.maintenanceLog.findUnique({
    where: { id },
    include: {
      facility: true,
      user: { select: { id: true, firstName: true, lastName: true, username: true } },
    },
  });
}

export async function createMaintenanceLog(userId: number, data: CreateMaintenanceInput) {
  await assertFacilityExists(data.facilityId);

  return prisma.maintenanceLog.create({
    data: {
      facilityId: data.facilityId,
      userId,
      date: data.date ?? new Date(),
      taskDescription: data.taskDescription,
      suppliesNeeded: nullableText(data.suppliesNeeded),
      priority: data.priority,
      status: "PENDING",
    },
    include: {
      facility: true,
      user: { select: { id: true, firstName: true, lastName: true, username: true } },
    },
  });
}

export async function updateMaintenanceLog(id: number, data: UpdateMaintenanceInput) {
  const existing = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Registro de mantenimiento no encontrado", "MAINTENANCE_NOT_FOUND", 404);
  }
  if (data.facilityId !== undefined) {
    await assertFacilityExists(data.facilityId);
  }

  return prisma.maintenanceLog.update({
    where: { id },
    data: {
      ...(data.facilityId !== undefined ? { facilityId: data.facilityId } : {}),
      ...(data.taskDescription !== undefined ? { taskDescription: data.taskDescription } : {}),
      ...(data.suppliesNeeded !== undefined ? { suppliesNeeded: nullableText(data.suppliesNeeded) } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
    },
    include: {
      facility: true,
      user: { select: { id: true, firstName: true, lastName: true, username: true } },
    },
  });
}

export async function updateMaintenanceStatus(id: number, status: string) {
  const existing = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Registro de mantenimiento no encontrado", "MAINTENANCE_NOT_FOUND", 404);
  }

  return prisma.maintenanceLog.update({
    where: { id },
    data: {
      status,
      resolvedAt: status === "RESOLVED" ? new Date() : null,
    },
    include: {
      facility: true,
      user: { select: { id: true, firstName: true, lastName: true, username: true } },
    },
  });
}

export async function deleteMaintenanceLog(id: number) {
  const existing = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Registro de mantenimiento no encontrado", "MAINTENANCE_NOT_FOUND", 404);
  }
  return prisma.maintenanceLog.delete({ where: { id } });
}
