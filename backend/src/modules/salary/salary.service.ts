import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import type { CreateSalaryInput } from "./salary.schema";

export async function getAllSalaries() {
  return prisma.salary.findMany({
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, username: true },
      },
    },
    orderBy: { paymentDate: "desc" },
  });
}

export async function getSalaryById(id: number) {
  const salary = await prisma.salary.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, username: true },
      },
    },
  });
  return salary;
}

export async function createSalary(data: CreateSalaryInput) {
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) {
    throw new AppError("Usuario no encontrado", "USER_NOT_FOUND", 404);
  }

  return prisma.salary.create({
    data: {
      userId: data.userId,
      amount: data.amount,
      paymentDate: new Date(data.paymentDate),
      receipt: data.receipt || null,
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, username: true },
      },
    },
  });
}

export async function updateSalary(id: number, data: Partial<CreateSalaryInput>) {
  const existing = await prisma.salary.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Registro salarial no encontrado", "SALARY_NOT_FOUND", 404);
  }

  return prisma.salary.update({
    where: { id },
    data: {
      amount: data.amount,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
      receipt: data.receipt,
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, username: true },
      },
    },
  });
}

export async function deleteSalary(id: number) {
  const existing = await prisma.salary.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Registro salarial no encontrado", "SALARY_NOT_FOUND", 404);
  }

  return prisma.salary.delete({ where: { id } });
}
