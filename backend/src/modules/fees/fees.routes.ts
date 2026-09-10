import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/admin";
import { validate } from "../../middleware/validate";
import {
  listFees,
  getFee,
  create,
  update,
  remove,
  assignFee,
  togglePaid,
  unassignFee,
  listMemberFees,
  listAllMemberFees,
} from "./fees.controller";
import {
  createFeeSchema,
  updateFeeSchema,
  feeIdSchema,
  memberIdSchema,
  feeIdParamSchema,
  assignFeeSchema,
  toggleFeePaidSchema,
} from "./fees.schema";

const router = Router();

// Rutas específicas ANTES de rutas genéricas con :id

// Consultas generales
router.get("/", authenticateToken, requireAdmin, listFees);
router.get("/all-assignments", authenticateToken, requireAdmin, listAllMemberFees);

// Asignación de aranceles a socios
router.post("/assign", authenticateToken, requireAdmin, validate(assignFeeSchema), assignFee);
router.post("/toggle-paid", authenticateToken, requireAdmin, validate(toggleFeePaidSchema), togglePaid);
router.get("/member/:memberId", authenticateToken, requireAdmin, validate(memberIdSchema, "params"), listMemberFees);
router.delete("/member/:memberId/fee/:feeId", authenticateToken, requireAdmin, validate(memberIdSchema, "params"), validate(feeIdParamSchema, "params"), unassignFee);

// CRUD de aranceles (rutas genéricas :id van AL FINAL)
router.get("/:id", authenticateToken, requireAdmin, validate(feeIdSchema, "params"), getFee);
router.post("/", authenticateToken, requireAdmin, validate(createFeeSchema), create);
router.put("/:id", authenticateToken, requireAdmin, validate(feeIdSchema, "params"), validate(updateFeeSchema), update);
router.delete("/:id", authenticateToken, requireAdmin, validate(feeIdSchema, "params"), remove);

export default router;
