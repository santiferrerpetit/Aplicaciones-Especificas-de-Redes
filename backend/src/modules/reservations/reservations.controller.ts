import type { Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../../middleware/auth";
import {
  cancelReservation,
  createReservation,
  getReservationById,
  listReservations,
  updateReservation,
} from "./reservations.service";

const currentUser = (req: AuthenticatedRequest) => {
  if (!req.user) throw new Error("Usuario no autenticado");
  return req.user;
};

export const list = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json(await listReservations(req.query as any));
});

export const get = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const reservation = await getReservationById(Number(req.params.id));
  if (!reservation) {
    res.status(404).json({ message: "Reserva no encontrada", code: "RESERVATION_NOT_FOUND" });
    return;
  }
  res.json(reservation);
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = currentUser(req);
  res.status(201).json(await createReservation(Number(user.id), req.body));
});

export const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = currentUser(req);
  res.json(await updateReservation(Number(req.params.id), Number(user.id), user.roleName, req.body));
});

export const cancel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = currentUser(req);
  res.json(await cancelReservation(Number(req.params.id), Number(user.id), user.roleName));
});
