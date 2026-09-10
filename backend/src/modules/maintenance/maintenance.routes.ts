import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { requireRoles } from "../../middleware/roles";
import { validate } from "../../middleware/validate";
import {
  createFacilityController,
  createLog,
  deactivateFacilityController,
  deleteLog,
  getLog,
  listFacilities,
  listLogs,
  updateFacilityController,
  updateLog,
  updateStatus,
} from "./maintenance.controller";
import {
  createFacilitySchema,
  createMaintenanceSchema,
  facilityIdSchema,
  facilityQuerySchema,
  maintenanceIdSchema,
  maintenanceQuerySchema,
  updateFacilitySchema,
  updateMaintenanceSchema,
  updateMaintenanceStatusSchema,
} from "./maintenance.schema";

const router = Router();

router.use(authenticateToken);

router.get("/facilities", validate(facilityQuerySchema, "query"), listFacilities);
router.post(
  "/facilities",
  requireRoles("Administrator", "Maintenance"),
  validate(createFacilitySchema),
  createFacilityController,
);
router.put(
  "/facilities/:id",
  requireRoles("Administrator", "Maintenance"),
  validate(facilityIdSchema, "params"),
  validate(updateFacilitySchema),
  updateFacilityController,
);
router.patch(
  "/facilities/:id/deactivate",
  requireRoles("Administrator", "Maintenance"),
  validate(facilityIdSchema, "params"),
  deactivateFacilityController,
);

router.get("/", validate(maintenanceQuerySchema, "query"), listLogs);
router.post(
  "/",
  requireRoles("Administrator", "Maintenance"),
  validate(createMaintenanceSchema),
  createLog,
);
router.get("/:id", validate(maintenanceIdSchema, "params"), getLog);
router.put(
  "/:id",
  requireRoles("Administrator", "Maintenance"),
  validate(maintenanceIdSchema, "params"),
  validate(updateMaintenanceSchema),
  updateLog,
);
router.patch(
  "/:id/status",
  requireRoles("Administrator", "Maintenance"),
  validate(maintenanceIdSchema, "params"),
  validate(updateMaintenanceStatusSchema),
  updateStatus,
);
router.delete(
  "/:id",
  requireRoles("Administrator"),
  validate(maintenanceIdSchema, "params"),
  deleteLog,
);

export default router;
