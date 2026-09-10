import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Loader2, Trash2, FileText, Image } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import FileUpload from "@/features/uploads/components/FileUpload";
import { useSalaries } from "../hooks/useSalaries";
import { useUsers } from "@/features/auth/hooks/useUsers";
import type { CreateSalaryInput, Salary } from "../api/salaryApi";
import type { UploadedFile } from "@/features/uploads/api/uploadsApi";

export default function SalaryPage() {
  const { salaries, isLoading, error, addSalary, removeSalary } = useSalaries();
  const { users, isLoading: usersLoading } = useUsers();
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const resetForm = () => {
    setSelectedUserId("");
    setAmount("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setReceiptUrl(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !amount || !paymentDate) {
      setFormError("Completá todos los campos obligatorios");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);

    const data: CreateSalaryInput = {
      userId: Number(selectedUserId),
      amount: Number(amount),
      paymentDate,
      receipt: receiptUrl || undefined,
    };

    const result = await addSalary(data);
    if (result) {
      resetForm();
      setShowForm(false);
    }
    setIsSubmitting(false);
  };

  const handleUploadComplete = (files: UploadedFile[]) => {
    if (files.length > 0) {
      setReceiptUrl(files[0].url);
    }
  };

  const isImageFile = (url: string) => /\.(jpg|jpeg|png|webp)$/i.test(url);

  const adminUsers = users.filter((u) => u.roleName === "Administrator");

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Salarios</h1>
          <p className="text-muted-foreground mt-1 text-sm">Registro de pagos de salarios con comprobante</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} variant="outline">
          <Plus data-icon="inline-start" />
          Nuevo pago
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Registrar pago de salario</CardTitle>
                <CardDescription>Completá los datos y adjuntá el comprobante</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="userId">Empleado</Label>
                      <Select value={selectedUserId} onValueChange={(v) => setSelectedUserId(v ?? "")} disabled={usersLoading}>
                        <SelectTrigger id="userId">
                          <SelectValue placeholder={usersLoading ? "Cargando..." : "Seleccionar empleado"} />
                        </SelectTrigger>
                        <SelectContent>
                          {adminUsers.map((u) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.firstName} {u.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="amount">Monto</Label>
                      <Input id="amount" type="number" step="0.01" min="0" placeholder="100000"
                        value={amount} onChange={(e) => setAmount(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="paymentDate">Fecha de pago</Label>
                      <Input id="paymentDate" type="date"
                        value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Comprobante</Label>
                    {receiptUrl ? (
                      <div className="flex items-center gap-2 bg-muted/50 rounded px-3 py-2 text-sm">
                        {isImageFile(receiptUrl) ? <Image className="size-4 shrink-0" /> : <FileText className="size-4 shrink-0" />}
                        <span className="truncate flex-1">Comprobante adjunto</span>
                        <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">Ver</a>
                        <button type="button" onClick={() => setReceiptUrl(null)} className="text-destructive hover:text-destructive/80 text-xs">Quitar</button>
                      </div>
                    ) : (
                      <FileUpload module="salaries" onUploadComplete={handleUploadComplete} />
                    )}
                  </div>

                  {formError && (
                    <Alert variant="destructive">
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3 pt-1">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting && <Loader2 className="animate-spin" />}
                      Guardar
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : salaries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No hay registros salariales</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Comprobante</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaries.map((s) => (
                <SalaryRow key={s.id} salary={s} onDelete={removeSalary} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function SalaryRow({ salary, onDelete }: { salary: Salary; onDelete: (id: number) => Promise<boolean> }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este registro salarial?")) return;
    setDeleting(true);
    await onDelete(salary.id);
    setDeleting(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("es-AR");
  const formatAmount = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);

  const isImageFile = (url: string | null) => url && /\.(jpg|jpeg|png|webp)$/i.test(url);

  return (
    <TableRow>
      <TableCell className="font-medium">
        {salary.user.firstName} {salary.user.lastName}
      </TableCell>
      <TableCell>{formatAmount(salary.amount)}</TableCell>
      <TableCell>{formatDate(salary.paymentDate)}</TableCell>
      <TableCell>
        {salary.receipt ? (
          <a href={salary.receipt} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
            {isImageFile(salary.receipt) ? <Image className="size-3.5" /> : <FileText className="size-3.5" />}
            Ver
          </a>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon-xs" onClick={handleDelete} disabled={deleting}>
          {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5 text-destructive" />}
        </Button>
      </TableCell>
    </TableRow>
  );
}
