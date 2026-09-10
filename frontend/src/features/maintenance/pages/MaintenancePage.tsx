import { useState } from "react";
import { Building2, CheckCircle2, CircleDot, Loader2, Plus, Trash2, Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMaintenance } from "../hooks/useMaintenance";
import type { MaintenancePriority, MaintenanceStatus } from "../api/maintenanceApi";

const statusLabels: Record<MaintenanceStatus, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En curso",
  RESOLVED: "Resuelto",
  CANCELLED: "Cancelado",
};

const priorityLabels: Record<MaintenancePriority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

const statusVariant = (status: MaintenanceStatus) => status === "RESOLVED" ? "secondary" : status === "CANCELLED" ? "outline" : status === "IN_PROGRESS" ? "default" : "destructive";
const priorityVariant = (priority: MaintenancePriority) => priority === "URGENT" || priority === "HIGH" ? "destructive" : priority === "LOW" ? "outline" : "secondary";

export default function MaintenancePage() {
  const { user } = useAuth();
  const canManage = user?.role.name === "Administrator" || user?.role.name === "Maintenance";
  const canDelete = user?.role.name === "Administrator";
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<MaintenancePriority | "">("");
  const { facilities, logs, isLoading, error, addFacility, addLog, editLog, changeStatus, removeLog, disableFacility } = useMaintenance({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });
  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [facilityName, setFacilityName] = useState("");
  const [facilityDescription, setFacilityDescription] = useState("");
  const [facilityReservable, setFacilityReservable] = useState(false);
  const [logFacilityId, setLogFacilityId] = useState("");
  const [logDescription, setLogDescription] = useState("");
  const [logSupplies, setLogSupplies] = useState("");
  const [logPriority, setLogPriority] = useState<MaintenancePriority>("MEDIUM");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFacilityForm = () => {
    setFacilityName("");
    setFacilityDescription("");
    setFacilityReservable(false);
    setShowFacilityForm(false);
  };

  const resetLogForm = () => {
    setEditingLogId(null);
    setLogFacilityId("");
    setLogDescription("");
    setLogSupplies("");
    setLogPriority("MEDIUM");
    setShowLogForm(false);
  };

  const handleFacilitySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!facilityName.trim()) return;
    setIsSubmitting(true);
    const result = await addFacility({ name: facilityName.trim(), description: facilityDescription.trim() || undefined, reservable: facilityReservable });
    setIsSubmitting(false);
    if (result) {
      toast.success("Instalación creada");
      resetFacilityForm();
    }
  };

  const handleLogSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!logFacilityId || !logDescription.trim()) {
      toast.error("Seleccioná una instalación y describí la tarea");
      return;
    }
    setIsSubmitting(true);
    const payload = { facilityId: Number(logFacilityId), taskDescription: logDescription.trim(), suppliesNeeded: logSupplies.trim() || undefined, priority: logPriority };
    const result = editingLogId ? await editLog(editingLogId, payload) : await addLog(payload);
    setIsSubmitting(false);
    if (result) {
      toast.success(editingLogId ? "Registro actualizado" : "Mantenimiento registrado");
      resetLogForm();
    }
  };

  const openLogEdit = (id: number) => {
    const log = logs.find((item) => item.id === id);
    if (!log) return;
    setEditingLogId(log.id);
    setLogFacilityId(String(log.facilityId));
    setLogDescription(log.taskDescription);
    setLogSupplies(log.suppliesNeeded ?? "");
    setLogPriority(log.priority);
    setShowLogForm(true);
  };

  const handleStatusChange = async (id: number, status: MaintenanceStatus) => {
    const result = await changeStatus(id, status);
    if (result) toast.success("Estado actualizado");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este registro de mantenimiento?")) return;
    const success = await removeLog(id);
    if (success) toast.success("Registro eliminado");
  };

  const handleDisableFacility = async (id: number) => {
    if (!window.confirm("¿Desactivar esta instalación?")) return;
    const success = await disableFacility(id);
    if (success) toast.success("Instalación desactivada");
  };

  return (
    <div className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"><div><h1 className="text-3xl font-light tracking-tight">Mantenimiento</h1><p className="text-muted-foreground mt-1 text-sm">Estado de instalaciones, reparaciones e insumos necesarios</p></div>{canManage && <div className="flex gap-2"><Button variant="outline" onClick={() => setShowFacilityForm(!showFacilityForm)}><Building2 data-icon="inline-start" /> Instalación</Button><Button onClick={() => setShowLogForm(!showLogForm)}><Plus data-icon="inline-start" /> Nueva tarea</Button></div>}</div>

      {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}

      {showFacilityForm && canManage && <Card className="mb-6"><CardHeader><div className="flex items-start justify-between"><div><CardTitle className="text-base">Nueva instalación</CardTitle><CardDescription>Las instalaciones reservables aparecen en el calendario.</CardDescription></div><Button variant="ghost" size="icon-sm" onClick={resetFacilityForm}><X /></Button></div></CardHeader><CardContent><form onSubmit={handleFacilitySubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"><div className="flex flex-col gap-2"><Label htmlFor="facility-name">Nombre</Label><Input id="facility-name" value={facilityName} onChange={(event) => setFacilityName(event.target.value)} placeholder="Cancha principal" /></div><div className="flex flex-col gap-2 md:col-span-2"><Label htmlFor="facility-description">Descripción</Label><Input id="facility-description" value={facilityDescription} onChange={(event) => setFacilityDescription(event.target.value)} placeholder="Medidas, ubicación o notas" /></div><label className="flex items-center gap-2 text-sm pb-2"><input type="checkbox" checked={facilityReservable} onChange={(event) => setFacilityReservable(event.target.checked)} /> Se puede reservar</label><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="animate-spin" />} Guardar</Button></form></CardContent></Card>}

      {showLogForm && canManage && <Card className="mb-6"><CardHeader><div className="flex items-start justify-between"><div><CardTitle className="text-base">{editingLogId ? "Editar tarea" : "Registrar tarea de mantenimiento"}</CardTitle><CardDescription>Definí prioridad e insumos para facilitar el seguimiento.</CardDescription></div><Button variant="ghost" size="icon-sm" onClick={resetLogForm}><X /></Button></div></CardHeader><CardContent><form onSubmit={handleLogSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"><div className="flex flex-col gap-2"><Label htmlFor="maintenance-facility">Instalación</Label><select id="maintenance-facility" value={logFacilityId} onChange={(event) => setLogFacilityId(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="">Seleccionar</option>{facilities.filter((facility) => facility.active).map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}</select></div><div className="flex flex-col gap-2 lg:col-span-2"><Label htmlFor="maintenance-description">Tarea</Label><Input id="maintenance-description" value={logDescription} onChange={(event) => setLogDescription(event.target.value)} placeholder="Reparar luminaria" /></div><div className="flex flex-col gap-2"><Label htmlFor="maintenance-priority">Prioridad</Label><select id="maintenance-priority" value={logPriority} onChange={(event) => setLogPriority(event.target.value as MaintenancePriority)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="flex flex-col gap-2 lg:col-span-3"><Label htmlFor="maintenance-supplies">Insumos necesarios</Label><Input id="maintenance-supplies" value={logSupplies} onChange={(event) => setLogSupplies(event.target.value)} placeholder="Tornillos, pintura..." /></div><div className="flex gap-2"><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="animate-spin" />} Guardar</Button><Button type="button" variant="outline" onClick={resetLogForm}>Cancelar</Button></div></form></CardContent></Card>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"><Card><CardContent className="p-4 flex items-center gap-3"><CircleDot className="size-5 text-destructive" /><div><p className="text-xs text-muted-foreground">Pendientes</p><p className="text-2xl font-medium">{logs.filter((log) => log.status === "PENDING").length}</p></div></CardContent></Card><Card><CardContent className="p-4 flex items-center gap-3"><Wrench className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">En curso</p><p className="text-2xl font-medium">{logs.filter((log) => log.status === "IN_PROGRESS").length}</p></div></CardContent></Card><Card><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="size-5 text-green-600" /><div><p className="text-xs text-muted-foreground">Resueltas</p><p className="text-2xl font-medium">{logs.filter((log) => log.status === "RESOLVED").length}</p></div></CardContent></Card></div>

      <Card className="mb-6"><CardHeader><CardTitle className="text-base">Instalaciones</CardTitle><CardDescription>Recursos disponibles para mantenimiento y reservas</CardDescription></CardHeader><CardContent className="p-0">{isLoading ? <div className="p-4"><Skeleton className="h-10 w-full" /></div> : facilities.length === 0 ? <div className="py-10 text-center text-muted-foreground">No hay instalaciones registradas.</div> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Descripción</TableHead><TableHead>Reservable</TableHead><TableHead>Estado</TableHead><TableHead className="w-24" /></TableRow></TableHeader><TableBody>{facilities.map((facility) => <TableRow key={facility.id}><TableCell className="font-medium">{facility.name}</TableCell><TableCell>{facility.description || "-"}</TableCell><TableCell>{facility.reservable ? <Badge variant="secondary">Sí</Badge> : <Badge variant="outline">No</Badge>}</TableCell><TableCell>{facility.active ? <Badge variant="secondary">Activa</Badge> : <Badge variant="outline">Inactiva</Badge>}</TableCell><TableCell>{canManage && facility.active && <Button variant="ghost" size="icon-sm" onClick={() => handleDisableFacility(facility.id)}><Trash2 className="text-destructive" /></Button>}</TableCell></TableRow>)}</TableBody></Table></div>}</CardContent></Card>

      <Card><CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3"><div><CardTitle className="text-base">Bitácora de mantenimiento</CardTitle><CardDescription>Seguimiento de reparaciones e incidencias</CardDescription></div><div className="flex gap-2"><select aria-label="Filtrar por estado" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as MaintenanceStatus | "")} className="h-8 rounded-md border border-input bg-background px-2 text-xs"><option value="">Todos los estados</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select aria-label="Filtrar por prioridad" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as MaintenancePriority | "")} className="h-8 rounded-md border border-input bg-background px-2 text-xs"><option value="">Todas las prioridades</option>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></CardHeader><CardContent className="p-0">{isLoading ? <div className="p-4 flex flex-col gap-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div> : logs.length === 0 ? <div className="py-16 text-center text-muted-foreground">No hay tareas con estos filtros.</div> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Instalación</TableHead><TableHead>Tarea</TableHead><TableHead>Prioridad</TableHead><TableHead>Estado</TableHead><TableHead>Responsable</TableHead><TableHead className="w-28" /></TableRow></TableHeader><TableBody>{logs.map((log) => <TableRow key={log.id}><TableCell>{new Date(log.date).toLocaleDateString("es-AR")}</TableCell><TableCell className="font-medium">{log.facility.name}</TableCell><TableCell><div>{log.taskDescription}</div>{log.suppliesNeeded && <div className="text-xs text-muted-foreground mt-1">Insumos: {log.suppliesNeeded}</div>}</TableCell><TableCell><Badge variant={priorityVariant(log.priority)}>{priorityLabels[log.priority]}</Badge></TableCell><TableCell>{canManage ? <select value={log.status} onChange={(event) => void handleStatusChange(log.id, event.target.value as MaintenanceStatus)} className="h-7 rounded border border-input bg-background px-2 text-xs">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : <Badge variant={statusVariant(log.status)}>{statusLabels[log.status]}</Badge>}</TableCell><TableCell>{log.user.firstName} {log.user.lastName}</TableCell><TableCell><div className="flex gap-1">{canManage && <Button variant="ghost" size="icon-sm" onClick={() => openLogEdit(log.id)}><Wrench /></Button>}{canDelete && <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(log.id)}><Trash2 className="text-destructive" /></Button>}</div></TableCell></TableRow>)}</TableBody></Table></div>}</CardContent></Card>
    </div>
  );
}
