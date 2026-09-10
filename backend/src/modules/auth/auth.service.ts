import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import type { RegisterInput, LoginInput } from "./auth.schema";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function registerUser(data: RegisterInput) {
  const existingEmail = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingEmail) {
    throw new AppError("El email ya está registrado", "EMAIL_EXISTS", 400);
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username: data.username },
  });
  if (existingUsername) {
    throw new AppError("El nombre de usuario ya está registrado", "USERNAME_EXISTS", 400);
  }

  const defaultRole = await prisma.role.findUnique({
    where: { name: "Professor" },
  });
  if (!defaultRole) {
    throw new AppError("Error de configuración del servidor", "ROLE_NOT_FOUND", 500);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: hashedPassword,
      roleId: defaultRole.id,
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      roleId: true,
      role: { select: { id: true, name: true } },
      createdAt: true,
    },
  });

  return newUser;
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { username: data.username },
    include: { role: { select: { id: true, name: true } } },
  });

  if (!user) {
    throw new AppError("Usuario o contraseña incorrectos", "INVALID_CREDENTIALS", 401);
  }

  const matchPassword = await bcrypt.compare(data.password, user.password);
  if (!matchPassword) {
    throw new AppError("Usuario o contraseña incorrectos", "INVALID_CREDENTIALS", 401);
  }

  const token = jwt.sign(
    {
      id: String(user.id),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.role.id,
      roleName: user.role.name,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  const { password: _, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      roleId: true,
      role: { select: { id: true, name: true } },
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
}

export async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      roleId: true,
      role: { select: { id: true, name: true } },
    },
    orderBy: {
      firstName: "asc",
    },
  });
}

