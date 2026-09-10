import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./modules/auth/auth.routes";
import membersRoutes from "./modules/members/members.routes";
import feesRoutes from "./modules/fees/fees.routes";
import disciplinesRoutes from "./modules/disciplines/disciplines.routes";
import socialFeesRoutes from "./modules/social-fees/social-fees.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import uploadRoutes from "./modules/uploads/uploads.routes";
import salaryRoutes from "./modules/salary/salary.routes";
import usersRoutes from "./modules/users/users.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import reservationsRoutes from "./modules/reservations/reservations.routes";
import maintenanceRoutes from "./modules/maintenance/maintenance.routes";
import { errorHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimiter";

const app = express();

app.use(cors());

app.use(generalLimiter);

const JSON_SIZE_LIMIT = "50mb";
app.use(express.json({ limit: JSON_SIZE_LIMIT }));
app.use(express.urlencoded({ limit: JSON_SIZE_LIMIT, extended: true }));

// Servir archivos subidos estáticamente
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API Routes - montamos cada módulo en su path
// Local: /api/*  |  Producción (Apache reescribe /~diez/api/* a /*): /auth, /members, etc.
app.use("/api/auth", authRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/fees", feesRoutes);
app.use("/api/disciplines", disciplinesRoutes);
app.use("/api/social-fees", socialFeesRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Apache en producción reescribe /~diez/api/* a /* (elimina el prefijo)
// Así que también montamos sin /api para que funcione en el servidor
app.use("/auth", authRoutes);
app.use("/members", membersRoutes);
app.use("/fees", feesRoutes);
app.use("/disciplines", disciplinesRoutes);
app.use("/social-fees", socialFeesRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/uploads", uploadRoutes);
app.use("/salaries", salaryRoutes);
app.use("/users", usersRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/reservations", reservationsRoutes);
app.use("/maintenance", maintenanceRoutes);
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Catch-all 404 for undefined API routes (does not serve frontend files)
app.use((_req, res) => {
  res.status(404).json({ message: "Ruta no encontrada", code: "NOT_FOUND" });
});

// Global error handler - SIEMPRE al final
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API corriendo en puerto ${PORT}`);
});
