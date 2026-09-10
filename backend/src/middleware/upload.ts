import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const module = (typeof req.params.module === "string" ? req.params.module : "general");
    const moduleDir = path.join(UPLOAD_DIR, module);
    fs.mkdirSync(moduleDir, { recursive: true });
    cb(null, moduleDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIMES.includes(file.mimetype) && !ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new Error(`Formato no permitido: ${file.originalname}. Solo JPG, PNG, WebP y PDF.`));
    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});
