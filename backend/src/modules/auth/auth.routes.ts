import { Router } from "express";
import { register, login, me, logout } from "./auth.controller";
import { authenticateToken } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { loginLimiter, registerLimiter } from "../../middleware/rateLimiter";
import { loginGuard } from "../../middleware/loginGuard";
import { registerSchema, loginSchema } from "./auth.schema";

const router = Router();

router.post("/register", registerLimiter, validate(registerSchema), register);
router.post("/login", loginLimiter, loginGuard, validate(loginSchema), login);
router.get("/me", authenticateToken, me);
router.post("/logout", logout);
// users endpoint moved to /api/users

export default router;

