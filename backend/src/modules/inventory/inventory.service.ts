import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import type { CreateInventoryInput, CreateLoanInput, UpdateInventoryInput } from "./inventory.schema";

const canManageAllLoans = (roleName: string) =>
  roleName === "Administrator" || roleName === "Maintenance";

const nullableText = (value?: string) => (value ? value : null);

export async function getAllInventory(includeInactive = false, lowStock = false) {
  const items = await prisma.inventory.findMany({
    where: includeInactive ? undefined : { active: true },
    include: {
      _count: { select: { loans: true } },
    },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  return lowStock
    ? items.filter((item) => item.availableQuantity <= item.minimumQuantity)
    : items;
}

export async function getInventoryById(id: number) {
  return prisma.inventory.findUnique({
    where: { id },
    include: {
      loans: {
        orderBy: { checkoutDate: "desc" },
        take: 20,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, username: true } },
        },
      },
    },
  });
}

export async function createInventory(data: CreateInventoryInput) {
  return prisma.inventory.create({
    data: {
      name: data.name,
      category: nullableText(data.category),
      location: nullableText(data.location),
      totalQuantity: data.totalQuantity,
      availableQuantity: data.totalQuantity,
      minimumQuantity: data.minimumQuantity,
    },
  });
}

export async function updateInventory(id: number, data: UpdateInventoryInput) {
  const item = await prisma.inventory.findUnique({ where: { id } });
  if (!item) {
    throw new AppError("Material no encontrado", "INVENTORY_NOT_FOUND", 404);
  }

  const borrowedQuantity = item.totalQuantity - item.availableQuantity;
  const nextTotal = data.totalQuantity ?? item.totalQuantity;
  if (nextTotal < borrowedQuantity) {
    throw new AppError(
      `La cantidad total no puede ser menor que las unidades prestadas (${borrowedQuantity})`,
      "INVENTORY_QUANTITY_INVALID",
    );
  }

  const updateData: Prisma.InventoryUpdateInput = {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.category !== undefined ? { category: nullableText(data.category) } : {}),
    ...(data.location !== undefined ? { location: nullableText(data.location) } : {}),
    ...(data.totalQuantity !== undefined
      ? { totalQuantity: data.totalQuantity, availableQuantity: nextTotal - borrowedQuantity }
      : {}),
    ...(data.minimumQuantity !== undefined ? { minimumQuantity: data.minimumQuantity } : {}),
    ...(data.active !== undefined ? { active: data.active } : {}),
  };

  return prisma.inventory.update({ where: { id }, data: updateData });
}

export async function deactivateInventory(id: number) {
  const item = await prisma.inventory.findUnique({
    where: { id },
    include: { loans: { where: { returned: false }, select: { id: true } } },
  });
  if (!item) {
    throw new AppError("Material no encontrado", "INVENTORY_NOT_FOUND", 404);
  }
  if (item.loans.length > 0) {
    throw new AppError("No se puede desactivar un material con préstamos activos", "ACTIVE_LOANS", 409);
  }

  return prisma.inventory.update({ where: { id }, data: { active: false } });
}

export async function getLoans(userId: number, roleName: string, returned?: boolean) {
  const where: Prisma.InventoryLoanWhereInput = {
    ...(returned === undefined ? {} : { returned }),
    ...(canManageAllLoans(roleName) ? {} : { userId }),
  };

  return prisma.inventoryLoan.findMany({
    where,
    include: {
      item: true,
      user: { select: { id: true, firstName: true, lastName: true, username: true } },
    },
    orderBy: { checkoutDate: "desc" },
  });
}

export async function createLoan(itemId: number, userId: number, data: CreateLoanInput) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.inventory.findUnique({ where: { id: itemId } });
    if (!item || !item.active) {
      throw new AppError("Material no disponible", "INVENTORY_NOT_FOUND", 404);
    }
    if (data.quantity > item.availableQuantity) {
      throw new AppError("No hay suficiente stock disponible", "INSUFFICIENT_STOCK", 409);
    }

    const loan = await tx.inventoryLoan.create({
      data: {
        itemId,
        userId,
        quantity: data.quantity,
        dueDate: data.dueDate,
        notes: nullableText(data.notes),
        checkoutDate: new Date(),
      },
      include: { item: true },
    });

    await tx.inventory.update({
      where: { id: itemId },
      data: { availableQuantity: { decrement: data.quantity } },
    });

    return loan;
  });
}

export async function returnLoan(loanId: number, userId: number, roleName: string) {
  return prisma.$transaction(async (tx) => {
    const loan = await tx.inventoryLoan.findUnique({
      where: { id: loanId },
      include: { item: true },
    });
    if (!loan) {
      throw new AppError("Préstamo no encontrado", "LOAN_NOT_FOUND", 404);
    }
    if (!canManageAllLoans(roleName) && loan.userId !== userId) {
      throw new AppError("No puedes devolver un préstamo de otro usuario", "FORBIDDEN", 403);
    }
    if (loan.returned) {
      throw new AppError("El préstamo ya fue devuelto", "LOAN_ALREADY_RETURNED", 409);
    }

    await tx.inventory.update({
      where: { id: loan.itemId },
      data: { availableQuantity: { increment: loan.quantity } },
    });

    return tx.inventoryLoan.update({
      where: { id: loanId },
      data: { returned: true, returnDate: new Date() },
      include: { item: true },
    });
  });
}
