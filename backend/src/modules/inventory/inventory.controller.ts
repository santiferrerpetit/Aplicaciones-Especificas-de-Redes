import type { Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../../middleware/auth";
import {
  createInventory,
  createLoan,
  deactivateInventory,
  getAllInventory,
  getInventoryById,
  getLoans,
  returnLoan,
  updateInventory,
} from "./inventory.service";

const currentUser = (req: AuthenticatedRequest) => {
  if (!req.user) throw new Error("Usuario no autenticado");
  return req.user;
};

export const listInventory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = req.query as unknown as { includeInactive: boolean; lowStock: boolean };
  const items = await getAllInventory(query.includeInactive, query.lowStock);
  res.json(items);
});

export const getInventory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await getInventoryById(Number(req.params.id));
  if (!item) {
    res.status(404).json({ message: "Material no encontrado", code: "INVENTORY_NOT_FOUND" });
    return;
  }
  res.json(item);
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await createInventory(req.body);
  res.status(201).json(item);
});

export const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await updateInventory(Number(req.params.id), req.body);
  res.json(item);
});

export const deactivate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await deactivateInventory(Number(req.params.id));
  res.json(item);
});

export const listLoans = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = currentUser(req);
  const query = req.query as unknown as { returned?: boolean };
  const returned = query.returned;
  const loans = await getLoans(Number(user.id), user.roleName, returned);
  res.json(loans);
});

export const createItemLoan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = currentUser(req);
  const loan = await createLoan(Number(req.params.id), Number(user.id), req.body);
  res.status(201).json(loan);
});

export const markLoanReturned = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = currentUser(req);
  const loan = await returnLoan(Number(req.params.id), Number(user.id), user.roleName);
  res.json(loan);
});
