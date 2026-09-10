import type { Request, Response } from "express";
import {
  getAllSalaries,
  getSalaryById,
  createSalary,
  updateSalary,
  deleteSalary,
} from "./salary.service";
import { asyncHandler } from "../../middleware/asyncHandler";

export const listSalaries = asyncHandler(async (_req: Request, res: Response) => {
  const salaries = await getAllSalaries();
  res.json(salaries);
});

export const getSalary = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const salary = await getSalaryById(id);
  if (!salary) {
    res.status(404).json({ message: "Registro salarial no encontrado" });
    return;
  }
  res.json(salary);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const salary = await createSalary(req.body);
  res.status(201).json(salary);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const salary = await updateSalary(id, req.body);
  res.json(salary);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await deleteSalary(id);
  res.status(204).send();
});
