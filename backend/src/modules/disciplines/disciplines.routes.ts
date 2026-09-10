import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/admin";
import { validate } from "../../middleware/validate";
import {
  listDisciplines,
  getDiscipline,
  create,
  setup,
  update,
  remove,
  listGroups,
  createGroupCtrl,
  getGroup,
  updateGroupCtrl,
  deleteGroupCtrl,
  assignMember,
  removeMember,
  listTeachers,
  listTeacherGroups,
} from "./disciplines.controller";
import {
  createDisciplineSchema,
  updateDisciplineSchema,
  disciplineIdSchema,
  createGroupSchema,
  updateGroupSchema,
  groupIdSchema,
  assignMemberSchema,
  memberIdParamSchema,
  setupDisciplineSchema,
} from "./disciplines.schema";

const router = Router();

// Teachers (profesores y administradores)
router.get("/teachers", authenticateToken, listTeachers);

// Disciplines
router.get("/", authenticateToken, listDisciplines);
router.post("/", authenticateToken, requireAdmin, validate(createDisciplineSchema), create);
router.post("/setup", authenticateToken, requireAdmin, validate(setupDisciplineSchema), setup);
router.get("/:id", authenticateToken, validate(disciplineIdSchema, "params"), getDiscipline);
router.put("/:id", authenticateToken, requireAdmin, validate(disciplineIdSchema, "params"), validate(updateDisciplineSchema), update);
router.delete("/:id", authenticateToken, requireAdmin, validate(disciplineIdSchema, "params"), remove);

// Groups within a discipline
router.get("/:id/groups", authenticateToken, validate(disciplineIdSchema, "params"), listGroups);
router.post("/:id/groups", authenticateToken, requireAdmin, validate(disciplineIdSchema, "params"), validate(createGroupSchema), createGroupCtrl);

// Groups (independent routes)
router.get("/groups/teacher/me", authenticateToken, listTeacherGroups);
router.get("/groups/:id", authenticateToken, validate(groupIdSchema, "params"), getGroup);
router.put("/groups/:id", authenticateToken, requireAdmin, validate(groupIdSchema, "params"), validate(updateGroupSchema), updateGroupCtrl);
router.delete("/groups/:id", authenticateToken, requireAdmin, validate(groupIdSchema, "params"), deleteGroupCtrl);
router.post("/groups/:id/members", authenticateToken, requireAdmin, validate(groupIdSchema, "params"), validate(assignMemberSchema), assignMember);
router.delete("/groups/:id/members/:memberId", authenticateToken, requireAdmin, validate(groupIdSchema, "params"), validate(memberIdParamSchema, "params"), removeMember);

export default router;
