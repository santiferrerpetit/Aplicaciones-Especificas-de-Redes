import type { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { asyncHandler } from "../../middleware/asyncHandler";

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      roleId: true,
      role: { select: { name: true } },
    },
    orderBy: { lastName: "asc" },
  });

  res.json(
    users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      roleId: u.roleId,
      roleName: u.role.name,
    }))
  );
});
