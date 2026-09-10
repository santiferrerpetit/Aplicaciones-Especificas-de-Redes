import { useMemo, useState } from "react";
import { CalendarDays, Clock3, Edit3, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useReservations } from "../hooks/useReservations";
import type { Reservation } from "../api/reservationsApi";

const pad = (value: number) => String(value).padStart(2, "0");

const toDateInput = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const toDateTimeInput = (value: string) => {
  const date = new Date(value);
  return `${toDateInput(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getMonday = (value: Date) => {
  const date = new Date(value);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatDay = (date: Date) => date.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });

export default function ReservationsPage() {
  const { user } = useAuth();
  const isAdministrator = user?.role.name === "Administrator";
  const [weekStart, setWeekStart] = useState(toDateInput(getMonday(new Date())));
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [facilityId, setFacilityId] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rangeStart = getMonday(new Date(`${weekStart}T00:00:00`));
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + 7);
  const { reservations, facilities, isLoading, error, addReservation, editReservation, removeReservation } = useReservations(
    rangeStart.toISOString(),
    rangeEnd.toISOString(),
  );

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const day = new Date(rangeStart);
    day.setDate(day.getDate() + index);
    return day;
  }), [weekStart]);

  const visibleReservations = reservations.filter((reservation) => reservation.status === "CONFIRMED");

  const resetForm = () => {
    setShowForm(false);
    setEditingReservation(null);
    setFacilityId(facilities[0] ? String(facilities[0].id) : "");
    setStartAt("");
    setEndAt("");
    setNotes("");
  };

  const openCreate = () => {
    const defaultStart = new Date();
    defaultStart.setMinutes(0, 0, 0);
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setHours(defaultEnd.getHours() + 1);
    setEditingReservation(null);
    setFacilityId(facilities[0] ? String(facilities[0].id) : "");
    setStartAt(toDateTimeInput(defaultStart.toISOString()));
    setEndAt(toDateTimeInput(defaultEnd.toISOString()));
    setNotes("");
    setShowForm(true);
  };

  const openEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setFacilityId(String(reservation.facilityId));
    setStartAt(toDateTimeInput(reservation.startAt));
    setEndAt(toDateTimeInput(reservation.endAt));
    setNotes(reservation.notes ?? "");
    setShowForm(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!facilityId || !startAt || !endAt || new Date(startAt) >= new Date(endAt)) {
      toast.error("Completá un intervalo de horario válido");
      return;
    }
    setIsSubmitting(true);
    const payload = {
      facilityId: Number(facilityId),
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      notes: notes.trim() || undefined,
    };
    const result = editingReservation
      ? await editReservation(editingReservation.id, payload)
      : await addReservation(payload);
    setIsSubmitting(false);
    if (result) {
      toast.success(editingReservation ? "Reserva actualizada" : "Reserva creada");
      resetForm();
    }
  };

  const handleCancel = async (reservation: Reservation) => {
    if (!window.confirm("¿Cancelar esta reserva?")) return;
    const success = await removeReservation(reservation.id);
    if (success) toast.success("Reserva cancelada");
  };

  const reservationsForDay = (day: Date) => visibleReservations.filter((reservation) => {
    const date = new Date(reservation.startAt);
    return date.getFullYear() === day.getFullYear() && date.getMonth() === day.getMonth() && date.getDate() === day.getDate();
  });

  return (
    <div className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div><h1 className="text-3xl font-light tracking-tight">Reservas</h1><p className="text-muted-foreground mt-1 text-sm">Organizá el uso de canchas y espacios del club</p></div>
        <Button onClick={openCreate}><Plus data-icon="inline-start" /> Nueva reserva</Button>
      </div>

      <Card className="mb-6"><CardContent className="p-4 flex flex-col sm:flex-row sm:items-end gap-4"><div className="flex flex-col gap-2"><Label htmlFor="week-start">Semana del</Label><Input id="week-start" type="date" value={weekStart} onChange={(event) => setWeekStart(toDateInput(getMonday(new Date(`${event.target.value}T00:00:00`))))} /></div><div className="text-sm text-muted-foreground pb-2">Solo usuarios internos autenticados pueden crear reservas.</div></CardContent></Card>

      {showForm && <Card className="mb-6 border-primary/30"><CardHeader><div className="flex items-start justify-between"><div><CardTitle className="text-base">{editingReservation ? "Editar reserva" : "Nueva reserva"}</CardTitle><CardDescription>Los horarios superpuestos se rechazan automáticamente.</CardDescription></div><Button variant="ghost" size="icon-sm" onClick={resetForm}><X /></Button></div></CardHeader><CardContent><form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"><div className="flex flex-col gap-2"><Label htmlFor="reservation-facility">Instalación</Label><select id="reservation-facility" value={facilityId} onChange={(event) => setFacilityId(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="">Seleccionar</option>{facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}</select></div><div className="flex flex-col gap-2"><Label htmlFor="reservation-start">Inicio</Label><Input id="reservation-start" type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} /></div><div className="flex flex-col gap-2"><Label htmlFor="reservation-end">Fin</Label><Input id="reservation-end" type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} /></div><div className="flex flex-col gap-2"><Label htmlFor="reservation-notes">Notas</Label><Input id="reservation-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Entrenamiento" /></div><div className="flex gap-2"><Button type="submit" disabled={isSubmitting || facilities.length === 0}>{isSubmitting && <Loader2 className="animate-spin" />} Guardar</Button><Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button></div></form>{facilities.length === 0 && <p className="text-sm text-muted-foreground mt-4">No hay instalaciones reservables configuradas.</p>}</CardContent></Card>}

      {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}

      {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">{days.map((day) => <Skeleton key={day.toISOString()} className="h-48 w-full" />)}</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">{days.map((day) => { const dayReservations = reservationsForDay(day); return <Card key={day.toISOString()} className="min-h-48"><CardHeader className="pb-2"><CardTitle className="text-sm capitalize">{formatDay(day)}</CardTitle></CardHeader><CardContent className="flex flex-col gap-2">{dayReservations.length === 0 ? <p className="text-xs text-muted-foreground py-4">Sin reservas</p> : dayReservations.map((reservation) => { const canEdit = isAdministrator || reservation.userId === user?.id; return <div key={reservation.id} className="rounded-lg border bg-muted/30 p-2 text-xs"><div className="font-medium truncate">{reservation.facility.name}</div><div className="flex items-center gap-1 text-muted-foreground mt-1"><Clock3 className="size-3" />{new Date(reservation.startAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} - {new Date(reservation.endAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</div><div className="text-muted-foreground mt-1 truncate">{reservation.user.firstName} {reservation.user.lastName}</div>{canEdit && <div className="flex gap-1 mt-2"><Button variant="ghost" size="icon-xs" onClick={() => openEdit(reservation)} aria-label="Editar reserva"><Edit3 /></Button><Button variant="ghost" size="icon-xs" onClick={() => handleCancel(reservation)} aria-label="Cancelar reserva"><X className="text-destructive" /></Button></div>}</div>; })}</CardContent></Card>; })}</div>}

      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-4" /><Badge variant="secondary">Confirmadas</Badge><span>Las reservas se muestran según la semana seleccionada.</span></div>
    </div>
  );
}
