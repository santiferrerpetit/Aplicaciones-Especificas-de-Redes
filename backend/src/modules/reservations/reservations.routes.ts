import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { cancel, create, get, list, update } from "./reservations.controller";
import {
  createReservationSchema,
  reservationIdSchema,
  reservationQuerySchema,
  updateReservationSchema,
} from "./reservations.schema";

const router = Router();

router.use(authenticateToken);
router.get("/", validate(reservationQuerySchema, "query"), list);
router.post("/", validate(createReservationSchema), create);
router.get("/:id", validate(reservationIdSchema, "params"), get);
router.put("/:id", validate(reservationIdSchema, "params"), validate(updateReservationSchema), update);
router.patch("/:id/cancel", validate(reservationIdSchema, "params"), cancel);

export default router;
