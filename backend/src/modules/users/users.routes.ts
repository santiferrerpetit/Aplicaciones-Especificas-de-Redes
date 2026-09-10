import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/admin";
import { listUsers } from "./users.controller";

const router = Router();

router.get("/", authenticateToken, requireAdmin, listUsers);

export default router;
