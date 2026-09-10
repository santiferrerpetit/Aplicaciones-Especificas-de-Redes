import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/AppError";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[ERROR]", err);

  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";

  const knownErrors: Record<string, { message: string; status: number }> = {
    EMAIL_EXISTS: { message: "El email ya está registrado", status: 400 },
    USERNAME_EXISTS: { message: "El nombre de usuario ya está registrado", status: 400 },
    ROLE_NOT_FOUND: { message: "Error de configuración del servidor", status: 500 },
    INVALID_CREDENTIALS: { message: "Usuario o contraseña incorrectos", status: 401 },
    DNI_EXISTS: { message: "Ya existe un socio con ese DNI", status: 400 },
    FEE_ALREADY_ASSIGNED: { message: "Este arancel ya está asignado al socio", status: 400 },
    FEE_NOT_ASSIGNED: { message: "El arancel no está asignado a este socio", status: 404 },
    VALIDATION_ERROR: { message: err.message || "Datos inválidos", status: 400 },
  };

  if (knownErrors[code]) {
    const known = knownErrors[code];
    res.status(known.status).json({ message: known.message, code });
    return;
  }

  res.status(statusCode).json({
    message: statusCode === 500 ? "Error interno del servidor" : err.message,
    code,
  });
}
