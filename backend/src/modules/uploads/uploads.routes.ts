import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { uploadLimiter } from "../../middleware/rateLimiter";
import { upload } from "../../middleware/upload";
import { validate } from "../../middleware/validate";
import { uploadFiles, list, remove } from "./uploads.controller";
import { uploadParamsSchema, listQuerySchema, deleteFileSchema, uploadBodySchema } from "./uploads.schema";

const router = Router();

router.use(authenticateToken);

function authorizeModuleUpload(req: any, res: any, next: any) {
  const module = typeof req.params.module === "string" ? req.params.module : "general";
  const roleName = req.user?.roleName;
  if ((module === "salaries" && roleName !== "Administrator") ||
      (module === "maintenance" && !["Administrator", "Maintenance"].includes(roleName))) {
    res.status(403).json({ message: "No tienes permisos para este tipo de archivo", code: "FORBIDDEN" });
    return;
  }
  next();
}

router.post("/:module", uploadLimiter, validate(uploadParamsSchema, "params"), authorizeModuleUpload, upload.array("files", 5), validate(uploadBodySchema), uploadFiles);
router.post("/", uploadLimiter, upload.array("files", 5), validate(uploadBodySchema), uploadFiles);

router.get("/", validate(listQuerySchema, "query"), list);
router.delete("/:id", validate(deleteFileSchema, "params"), remove);

export default router;
