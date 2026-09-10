import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/admin";
import { validate } from "../../middleware/validate";
import {
  listSocialFees,
  getSocialFee,
  create,
  update,
  remove,
  listMemberSocialFees,
  togglePaid,
  generateMonth,
} from "./social-fees.controller";
import {
  createSocialFeeSchema,
  updateSocialFeeSchema,
  socialFeeIdSchema,
  memberIdSchema,
  toggleSocialFeePaidSchema,
  generateMonthSchema,
} from "./social-fees.schema";

const router = Router();

router.get("/", authenticateToken, requireAdmin, listSocialFees);
router.post("/", authenticateToken, requireAdmin, validate(createSocialFeeSchema), create);
router.get("/:id", authenticateToken, requireAdmin, validate(socialFeeIdSchema, "params"), getSocialFee);
router.put("/:id", authenticateToken, requireAdmin, validate(socialFeeIdSchema, "params"), validate(updateSocialFeeSchema), update);
router.delete("/:id", authenticateToken, requireAdmin, validate(socialFeeIdSchema, "params"), remove);

router.get("/member/:memberId", authenticateToken, requireAdmin, validate(memberIdSchema, "params"), listMemberSocialFees);
router.post("/toggle-paid", authenticateToken, requireAdmin, validate(toggleSocialFeePaidSchema), togglePaid);
router.post("/generate-month", authenticateToken, requireAdmin, validate(generateMonthSchema), generateMonth);

export default router;
