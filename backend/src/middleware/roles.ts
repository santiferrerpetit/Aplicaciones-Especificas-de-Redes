import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth";

export type RoleName = "Administrator" | "Professor" | "Maintenance";

export function requireRoles(...allowedRoles: RoleName[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.roleName as RoleName)) {
      res.status(403).json({
        message: "Acceso denegado para el rol actual",
        code: "FORBIDDEN",
      });
      return;
    }

    next();
  };
}
