import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, LogOut, ChevronDown, CalendarDays, Package, Wrench } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkBase =
    "px-3 py-2 rounded-lg text-sm font-medium transition-colors";
  const navLinkInactive = "text-muted-foreground hover:text-foreground";
  const navLinkActive = "text-foreground bg-muted";

  return (
    <nav className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Building2 className="size-5 text-primary" />
            <span className="text-sm font-semibold tracking-tight">Gestión de Clubes</span>
          </Link>

          <ul className="flex items-center gap-1">
            {!user ? (
              <>
                <li>
                  <Link to="/" className={`${navLinkBase} ${isActive("/") ? navLinkActive : navLinkInactive}`}>
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link to="/auth/login" className={`${navLinkBase} ${isActive("/auth/login") ? navLinkActive : navLinkInactive}`}>
                    Ingresar
                  </Link>
                </li>
                <li>
                  <Link to="/auth/register">
                    <Button size="sm">Registrarse</Button>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/dashboard" className={`${navLinkBase} ${isActive("/dashboard") ? navLinkActive : navLinkInactive}`}>
                    Panel
                  </Link>
                </li>
                <li>
                  <Link to="/members" className={`${navLinkBase} ${isActive("/members") ? navLinkActive : navLinkInactive}`}>
                    Socios
                  </Link>
                </li>
                <li>
                  <Link to="/fees" className={`${navLinkBase} ${isActive("/fees") ? navLinkActive : navLinkInactive}`}>
                    Aranceles
                  </Link>
                </li>
                <li>
                  <Link to="/disciplines" className={`${navLinkBase} ${isActive("/disciplines") ? navLinkActive : navLinkInactive}`}>
                    Disciplinas
                  </Link>
                </li>
                <li>
                  <Link to="/inventory" className={`${navLinkBase} ${isActive("/inventory") ? navLinkActive : navLinkInactive}`}>
                    <Package className="inline size-3.5 mr-1" />Inventario
                  </Link>
                </li>
                <li>
                  <Link to="/reservations" className={`${navLinkBase} ${isActive("/reservations") ? navLinkActive : navLinkInactive}`}>
                    <CalendarDays className="inline size-3.5 mr-1" />Reservas
                  </Link>
                </li>
                {(user.role?.name === "Administrator" || user.role?.name === "Maintenance") && (
                  <li>
                    <Link to="/maintenance" className={`${navLinkBase} ${isActive("/maintenance") ? navLinkActive : navLinkInactive}`}>
                      <Wrench className="inline size-3.5 mr-1" />Mantenimiento
                    </Link>
                  </li>
                )}
                {(user.role?.name === "Administrator" || user.role?.name === "Professor") && (
                  <li>
                    <Link to="/attendance" className={`${navLinkBase} ${isActive("/attendance") ? navLinkActive : navLinkInactive}`}>
                      Asistencias
                    </Link>
                  </li>
                )}
                {user.role?.name === "Administrator" && (
                  <li>
                    <Link to="/salaries" className={`${navLinkBase} ${isActive("/salaries") ? navLinkActive : navLinkInactive}`}>
                      Salarios
                    </Link>
                  </li>
                )}
                <li className="ml-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="gap-1" />}>
                      {user.firstName}
                      <ChevronDown className="size-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                        <LogOut data-icon="inline-start" />
                        Salir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
