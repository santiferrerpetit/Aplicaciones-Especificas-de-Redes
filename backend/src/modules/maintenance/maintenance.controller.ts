import type { Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../../middleware/auth";
import {
  createFacility,
  createMaintenanceLog,
  deactivateFacility,
  deleteMaintenanceLog,
  getFacilities,
  getMaintenanceLogById,
  listMaintenanceLogs,
  updateFacility,
  updateMaintenanceLog,
  updateMaintenanceStatus,
} from "./maintenance.service";

const currentUser = (req: AuthenticatedRequest) => {
  if (!req.user) throw new Error("Usuario no autenticado");
  return req.user;
};

export const listFacilities = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = req.query as unknown as { includeInactive: boolean; reservableOnly: boolean };
  res.json(await getFacilities(query.includeInactive, query.reservableOnly));
});

export const createFacilityController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.status(201).json(await createFacility(req.body));
});

export const updateFacilityController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json(await updateFacility(Number(req.params.id), req.body));
});

export const deactivateFacilityController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json(await deactivateFacility(Number(req.params.id)));
});

export const listLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json(await listMaintenanceLogs(req.query as any));
});

export const getLog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const log = await getMaintenanceLogById(Number(req.params.id));
  if (!log) {
    res.status(404).json({ message: "Registro de mantenimiento no encontrado", code: "MAINTENANCE_NOT_FOUND" });
    return;
  }
  res.json(log);
});

export const createLog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = currentUser(req);
  res.status(201).json(await createMaintenanceLog(Number(user.id), req.body));
});

export const updateLog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json(await updateMaintenanceLog(Number(req.params.id), req.body));
});

export const updateStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json(await updateMaintenanceStatus(Number(req.params.id), req.body.status));
});

export const deleteLog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await deleteMaintenanceLog(Number(req.params.id));
  res.status(204).send();
});
