import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  listAttendance,
  save,
  stats,
} from "./attendance.controller";
import { getAttendanceSchema, recordAttendanceSchema } from "./attendance.schema";

const router = Router();

router.get("/", authenticateToken, validate(getAttendanceSchema, "query"), listAttendance);
router.post("/", authenticateToken, validate(recordAttendanceSchema), save);
router.get("/stats", authenticateToken, stats);

export default router;
