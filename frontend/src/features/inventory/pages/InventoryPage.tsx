import { useMemo, useState } from "react";
import { Archive, ArrowDownToLine, Check, Loader2, Package, Pencil, Plus, RotateCcw, X } from "lucide-react";
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
import { useInventory } from "../hooks/useInventory";
import type { InventoryItem } from "../api/inventoryApi";

type InventoryForm = {
  name: string;
  category: string;
  location: string;
  totalQuantity: string;
  minimumQuantity: string;
};

const emptyForm: InventoryForm = {
  name: "",
  category: "",
  location: "",
  totalQuantity: "1",
  minimumQuantity: "0",
};

const formatDate = (date: string) => new Date(date).toLocaleDateString("es-AR");

export default function InventoryPage() {
  const { user } = useAuth();
  const canManage = user?.role.name === "Administrator" || user?.role.name === "Maintenance";
  const [includeInactive, setIncludeInactive] = useState(false);
  const { items, loans, isLoading, error, addItem, editItem, deactivateItem, loanItem, returnLoan } = useInventory(includeInactive);
  const [activeTab, setActiveTab] = useState<"items" | "loans">("items");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<InventoryForm>(emptyForm);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [loanQuantity, setLoanQuantity] = useState("1");
  const [loanDueDate, setLoanDueDate] = useState("");
  const [loanNotes, setLoanNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();
    if (!normalizedSearch) return items;
    return items.filter((item) =>
      [item.name, item.category, item.location].some((value) => value?.toLowerCase().includes(normalizedSearch)),
    );
  }, [items, search]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingItem(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category ?? "",
      location: item.location ?? "",
      totalQuantity: String(item.totalQuantity),
      minimumQuantity: String(item.minimumQuantity),
    });
    setShowForm(true);
  };

  const handleItemSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || Number(form.totalQuantity) < 0 || Number(form.minimumQuantity) < 0) {
      toast.error("Completá el nombre y cantidades válidas");
      return;
    }
    setIsSubmitting(true);
    const payload = {
      name: form.name.trim(),
      category: form.category.trim() || undefined,
      location: form.location.trim() || undefined,
      totalQuantity: Number(form.totalQuantity),
      minimumQuantity: Number(form.minimumQuantity),
    };
    const result = editingItem ? await editItem(editingItem.id, payload) : await addItem(payload);
    setIsSubmitting(false);
    if (result) {
      toast.success(editingItem ? "Material actualizado" : "Material creado");
      resetForm();
    }
  };

  const handleDeactivate = async (item: InventoryItem) => {
    if (!window.confirm(`¿Desactivar ${item.name}?`)) return;
    const success = await deactivateItem(item.id);
    if (success) toast.success("Material desactivado");
  };

  const openLoan = (item: InventoryItem) => {
    setSelectedItem(item);
    setLoanQuantity("1");
    setLoanDueDate("");
    setLoanNotes("");
  };

  const handleLoan = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedItem || Number(loanQuantity) < 1 || Number(loanQuantity) > selectedItem.availableQuantity) {
      toast.error("La cantidad supera el stock disponible");
      return;
    }
    setIsSubmitting(true);
    const success = await loanItem(selectedItem.id, {
      quantity: Number(loanQuantity),
      dueDate: loanDueDate ? new Date(`${loanDueDate}T23:59:59`).toISOString() : undefined,
      notes: loanNotes.trim() || undefined,
    });
    setIsSubmitting(false);
    if (success) {
      toast.success("Préstamo registrado");
      setSelectedItem(null);
    }
  };

  const handleReturn = async (id: number) => {
    const success = await returnLoan(id);
    if (success) toast.success("Devolución registrada");
  };

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Inventario</h1>
          <p className="text-muted-foreground mt-1 text-sm">Materiales deportivos, stock y préstamos del club</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} variant="outline">
            <Plus data-icon="inline-start" /> Nuevo material
          </Button>
        )}
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit mb-6">
        <button className={`px-4 py-1.5 rounded-md text-sm ${activeTab === "items" ? "bg-background shadow-sm" : "text-muted-foreground"}`} onClick={() => setActiveTab("items")}>
          Materiales
        </button>
        <button className={`px-4 py-1.5 rounded-md text-sm ${activeTab === "loans" ? "bg-background shadow-sm" : "text-muted-foreground"}`} onClick={() => setActiveTab("loans")}>
          Préstamos
        </button>
      </div>

      {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}

      {activeTab === "items" && (
        <>
          {showForm && canManage && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">{editingItem ? "Editar material" : "Nuevo material"}</CardTitle>
                <CardDescription>El stock disponible se calcula automáticamente a partir de los préstamos.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleItemSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  <div className="flex flex-col gap-2 lg:col-span-2"><Label htmlFor="inventory-name">Nombre</Label><Input id="inventory-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Pelotas de fútbol" /></div>
                  <div className="flex flex-col gap-2"><Label htmlFor="inventory-category">Categoría</Label><Input id="inventory-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Entrenamiento" /></div>
                  <div className="flex flex-col gap-2"><Label htmlFor="inventory-location">Ubicación</Label><Input id="inventory-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Depósito A" /></div>
                  <div className="flex flex-col gap-2"><Label htmlFor="inventory-total">Cantidad total</Label><Input id="inventory-total" type="number" min="0" value={form.totalQuantity} onChange={(e) => setForm({ ...form, totalQuantity: e.target.value })} /></div>
                  <div className="flex flex-col gap-2"><Label htmlFor="inventory-minimum">Stock mínimo</Label><Input id="inventory-minimum" type="number" min="0" value={form.minimumQuantity} onChange={(e) => setForm({ ...form, minimumQuantity: e.target.value })} /></div>
                  <div className="flex gap-2 lg:col-span-2"><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="animate-spin" />} Guardar</Button><Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button></div>
                </form>
              </CardContent>
            </Card>
          )}

          {selectedItem && (
            <Card className="mb-6 border-primary/30">
              <CardHeader><div className="flex items-start justify-between"><div><CardTitle className="text-base">Registrar préstamo</CardTitle><CardDescription>{selectedItem.name} · {selectedItem.availableQuantity} disponibles</CardDescription></div><Button variant="ghost" size="icon-sm" onClick={() => setSelectedItem(null)}><X /></Button></div></CardHeader>
              <CardContent><form onSubmit={handleLoan} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"><div className="flex flex-col gap-2"><Label htmlFor="loan-quantity">Cantidad</Label><Input id="loan-quantity" type="number" min="1" max={selectedItem.availableQuantity} value={loanQuantity} onChange={(e) => setLoanQuantity(e.target.value)} /></div><div className="flex flex-col gap-2"><Label htmlFor="loan-due">Devolver antes de</Label><Input id="loan-due" type="date" value={loanDueDate} onChange={(e) => setLoanDueDate(e.target.value)} /></div><div className="flex flex-col gap-2 md:col-span-2"><Label htmlFor="loan-notes">Observaciones</Label><Input id="loan-notes" value={loanNotes} onChange={(e) => setLoanNotes(e.target.value)} placeholder="Actividad o entrenamiento" /></div><div className="flex gap-2"><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="animate-spin" />} Confirmar</Button><Button type="button" variant="outline" onClick={() => setSelectedItem(null)}>Cancelar</Button></div></form></CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3"><div><CardTitle className="text-base">Materiales registrados</CardTitle><CardDescription>Control de disponibilidad y niveles mínimos</CardDescription></div><div className="flex items-center gap-3"><Input className="w-52" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar material" /><label className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap"><input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} /> Inactivos</label></div></CardHeader>
            <CardContent className="p-0">
              {isLoading ? <div className="p-4 flex flex-col gap-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div> : filteredItems.length === 0 ? <div className="py-16 text-center text-muted-foreground"><Package className="size-8 mx-auto mb-2 opacity-50" /><p>No hay materiales registrados.</p></div> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Material</TableHead><TableHead>Ubicación</TableHead><TableHead>Stock</TableHead><TableHead>Estado</TableHead><TableHead className="w-40" /></TableRow></TableHeader><TableBody>{filteredItems.map((item) => { const lowStock = item.availableQuantity <= item.minimumQuantity; return <TableRow key={item.id}><TableCell><div className="font-medium">{item.name}</div><div className="text-xs text-muted-foreground">{item.category || "Sin categoría"}</div></TableCell><TableCell>{item.location || "-"}</TableCell><TableCell><span className={lowStock ? "text-destructive font-medium" : ""}>{item.availableQuantity}</span> / {item.totalQuantity}{lowStock && <Badge variant="destructive" className="ml-2">Stock bajo</Badge>}</TableCell><TableCell>{item.active ? <Badge variant="secondary">Activo</Badge> : <Badge variant="outline">Inactivo</Badge>}</TableCell><TableCell><div className="flex gap-1 justify-end">{item.active && <Button variant="outline" size="sm" onClick={() => openLoan(item)} disabled={item.availableQuantity === 0}><ArrowDownToLine /> Prestar</Button>}{canManage && <Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)}><Pencil /></Button>}{canManage && item.active && <Button variant="ghost" size="icon-sm" onClick={() => handleDeactivate(item)}><Archive className="text-destructive" /></Button>}</div></TableCell></TableRow>; })}</TableBody></Table></div>}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "loans" && <Card><CardHeader><CardTitle className="text-base">Historial de préstamos</CardTitle><CardDescription>{canManage ? "Todos los préstamos del club" : "Tus préstamos registrados"}</CardDescription></CardHeader><CardContent className="p-0">{isLoading ? <div className="p-4"><Skeleton className="h-32 w-full" /></div> : loans.length === 0 ? <div className="py-16 text-center text-muted-foreground"><p>No hay préstamos registrados.</p></div> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Material</TableHead><TableHead>Responsable</TableHead><TableHead>Cantidad</TableHead><TableHead>Salida</TableHead><TableHead>Estado</TableHead><TableHead className="w-28" /></TableRow></TableHeader><TableBody>{loans.map((loan) => <TableRow key={loan.id}><TableCell className="font-medium">{loan.item.name}</TableCell><TableCell>{loan.user.firstName} {loan.user.lastName}</TableCell><TableCell>{loan.quantity}</TableCell><TableCell>{formatDate(loan.checkoutDate)}</TableCell><TableCell>{loan.returned ? <Badge variant="secondary"><Check /> Devuelto</Badge> : <Badge>Activo</Badge>}</TableCell><TableCell>{!loan.returned && <Button variant="outline" size="sm" onClick={() => handleReturn(loan.id)}><RotateCcw /> Devolver</Button>}</TableCell></TableRow>)}</TableBody></Table></div>}</CardContent></Card>}
    </div>
  );
}
