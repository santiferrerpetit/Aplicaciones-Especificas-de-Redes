import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function saveFileRecords(
  files: Express.Multer.File[],
  module: string,
  userId: number,
  refId?: number
) {
  const records = files.map((f) => ({
    originalName: f.originalname,
    storedName: f.filename,
    mimeType: f.mimetype,
    size: f.size,
    module,
    refId: refId ?? null,
    url: `/uploads/${module}/${f.filename}`,
    uploadedById: userId,
  }));

  return prisma.$transaction(
    records.map((r) => prisma.uploadedFile.create({ data: r }))
  );
}

export async function listFiles(module?: string, refId?: number) {
  const where = {
    ...(module ? { module } : {}),
    ...(refId ? { refId } : {}),
  };
  return prisma.uploadedFile.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteFile(id: number, userId: number, roleName: string) {
  const file = await prisma.uploadedFile.findUnique({ where: { id } });
  if (!file) {
    throw new AppError("Archivo no encontrado", "FILE_NOT_FOUND", 404);
  }
  if (roleName !== "Administrator" && file.uploadedById !== userId) {
    throw new AppError("No puedes eliminar un archivo de otro usuario", "FORBIDDEN", 403);
  }

  const filePath = path.join(UPLOAD_DIR, file.module, file.storedName);
  try {
    fs.unlinkSync(filePath);
  } catch {
    // archivo ya no existe en disco, continuamos
  }

  await prisma.uploadedFile.delete({ where: { id } });
  return { deleted: true };
}
