import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <p className="text-sm text-muted-foreground mb-2">Error 403</p>
        <h1 className="text-3xl font-light tracking-tight">Acceso denegado</h1>
        <p className="text-muted-foreground mt-2 mb-6">Tu rol no tiene permisos para acceder a esta sección.</p>
        <Link to="/dashboard"><Button>Volver al panel</Button></Link>
      </div>
    </div>
  );
}
