import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/admin";
import { validate } from "../../middleware/validate";
import { listSalaries, getSalary, create, update, remove } from "./salary.controller";
import { createSalarySchema, updateSalarySchema, salaryIdSchema } from "./salary.schema";

const router = Router();

router.get("/", authenticateToken, requireAdmin, listSalaries);
router.get("/:id", authenticateToken, requireAdmin, validate(salaryIdSchema, "params"), getSalary);
router.post("/", authenticateToken, requireAdmin, validate(createSalarySchema), create);
router.put("/:id", authenticateToken, requireAdmin, validate(salaryIdSchema, "params"), validate(updateSalarySchema), update);
router.delete("/:id", authenticateToken, requireAdmin, validate(salaryIdSchema, "params"), remove);

export default router;
