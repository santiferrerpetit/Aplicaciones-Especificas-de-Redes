import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { requireRoles } from "../../middleware/roles";
import { validate } from "../../middleware/validate";
import {
  create,
  createItemLoan,
  deactivate,
  getInventory,
  listInventory,
  listLoans,
  markLoanReturned,
  update,
} from "./inventory.controller";
import {
  createInventorySchema,
  createLoanSchema,
  inventoryIdSchema,
  inventoryQuerySchema,
  loanIdSchema,
  updateInventorySchema,
} from "./inventory.schema";

const router = Router();

router.use(authenticateToken);

router.get("/loans", listLoans);
router.patch("/loans/:id/return", validate(loanIdSchema, "params"), markLoanReturned);

router.get("/", validate(inventoryQuerySchema, "query"), listInventory);
router.post("/", requireRoles("Administrator", "Maintenance"), validate(createInventorySchema), create);
router.get("/:id", validate(inventoryIdSchema, "params"), getInventory);
router.post("/:id/loans", validate(inventoryIdSchema, "params"), validate(createLoanSchema), createItemLoan);
router.put(
  "/:id",
  requireRoles("Administrator", "Maintenance"),
  validate(inventoryIdSchema, "params"),
  validate(updateInventorySchema),
  update,
);
router.delete(
  "/:id",
  requireRoles("Administrator", "Maintenance"),
  validate(inventoryIdSchema, "params"),
  deactivate,
);

export default router;
