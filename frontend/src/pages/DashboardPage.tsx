import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Receipt,
  Clock,
  Package,
  Wrench,
  CheckSquare,
  DollarSign,
  CalendarDays,
} from "lucide-react";

const modules = [
  {
    title: "Socios",
    description: "Gestiona el registro, edición y seguimiento de socios del club.",
    icon: Users,
    to: "/members",
    available: true,
  },
  {
    title: "Aranceles",
    description: "Gestiona aranceles deportivos y su asignación a socios.",
    icon: Receipt,
    to: "/fees",
    available: true,
  },
  {
    title: "Disciplinas",
    description: "Crea grupos por deporte y gestiona horarios de práctica.",
    icon: Clock,
    to: "/disciplines",
    available: true,
  },
  {
    title: "Asistencias",
    description: "Toma asistencia diaria a los alumnos y consulta estadísticas.",
    icon: CheckSquare,
    to: "/attendance",
    available: true,
  },
  {
    title: "Inventario",
    description: "Control de stock y préstamos de materiales deportivos.",
    icon: Package,
    to: "/inventory",
    available: true,
  },
  {
    title: "Reservas",
    description: "Calendario de canchas y espacios comunes para usuarios internos.",
    icon: CalendarDays,
    to: "/reservations",
    available: true,
  },
  {
    title: "Mantenimiento",
    description: "Bitácora de reparaciones y estado de instalaciones.",
    icon: Wrench,
    to: "/maintenance",
    available: true,
  },
  {
    title: "Salarios",
    description: "Registro de pagos de salarios con comprobantes.",
    icon: DollarSign,
    to: "/salaries",
    available: true,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardMotion = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-light tracking-tight">
          Bienvenido{user ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Rol: <span className="text-primary font-medium">{user?.role?.name ?? "Sin rol"}</span>
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {modules.map((mod) => {
          const Icon = mod.icon;
          const content = (
            <Card className="h-full hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <Icon className="size-5 text-muted-foreground" />
                  {!mod.available && (
                    <Badge variant="secondary">Próximamente</Badge>
                  )}
                </div>
                <CardTitle className="text-base font-medium mt-3">{mod.title}</CardTitle>
                <CardDescription>{mod.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0" />
            </Card>
          );

          return (
            <motion.div key={mod.title} variants={cardMotion}>
              {mod.available ? (
                <Link to={mod.to} className="group cursor-pointer block">
                  {content}
                </Link>
              ) : (
                <div className="opacity-50 cursor-not-allowed">{content}</div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
