import type { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, getUserById, getUsers } from "./auth.service";
import { asyncHandler } from "../../middleware/asyncHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const newUser = await registerUser(data);
  res.status(201).json(newUser);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await loginUser(data);
  res.json(result);
});

export const me = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = Number((req as any).user?.id);
  if (!userId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }
  const user = await getUserById(userId);
  if (!user) {
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }
  res.json({ user });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ message: "Logout exitoso" });
});

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await getUsers();
  res.json(users);
});

