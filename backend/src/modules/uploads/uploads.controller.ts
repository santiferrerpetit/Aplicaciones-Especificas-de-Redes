import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { saveFileRecords, listFiles, deleteFile } from "./uploads.service";

export const uploadFiles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ message: "No se enviaron archivos", code: "NO_FILES" });
    return;
  }

  const module = (typeof req.params.module === "string" ? req.params.module : "general");
  const userId = Number(req.user!.id);

  const refId = req.body.refId ? Number(req.body.refId) : undefined;
  if ((module === "salaries" && req.user!.roleName !== "Administrator") ||
      (module === "maintenance" && !["Administrator", "Maintenance"].includes(req.user!.roleName))) {
    res.status(403).json({ message: "No tienes permisos para este tipo de archivo", code: "FORBIDDEN" });
    return;
  }

  const records = await saveFileRecords(files, module, userId, refId);
  res.status(201).json(records);
});

export const list = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const module = req.query.module as string | undefined;
  const refId = req.query.refId ? Number(req.query.refId) : undefined;
  if (module === "salaries" && req.user!.roleName !== "Administrator") {
    res.status(403).json({ message: "No tienes permisos para consultar estos archivos", code: "FORBIDDEN" });
    return;
  }
  const files = await listFiles(module, refId);
  res.json(files);
});

export const remove = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  await deleteFile(id, Number(req.user!.id), req.user!.roleName);
  res.status(204).send();
});
