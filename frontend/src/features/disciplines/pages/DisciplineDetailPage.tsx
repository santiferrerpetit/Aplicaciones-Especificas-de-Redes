import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useDiscipline } from "@/features/disciplines/hooks/useDisciplines";
import { useGroups } from "@/features/disciplines/hooks/useDisciplines";
import { useTeachers } from "@/features/disciplines/hooks/useDisciplines";
import { useMembers } from "@/features/members/hooks/useMembers";
import { useFees } from "@/features/fees/hooks/useFees";
import GroupList from "@/features/disciplines/components/GroupList";
import GroupForm from "@/features/disciplines/components/GroupForm";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Users,
  Receipt,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import type {
  Group,
  CreateGroupInput,
  UpdateGroupInput,
  SportsFee as DisciplineFee,
} from "@/features/disciplines/api/disciplinesApi";

import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

const CATEGORIES = ["Menor", "Infantil", "Juvenil", "Adulto", "Senior"];

export default function DisciplineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const disciplineId = id ? Number(id) : null;

  const {
    discipline,
    isLoading: disciplineLoading,
    error: disciplineError,
    refetch: refetchDiscipline,
  } = useDiscipline(disciplineId);
  const {
    groups,
    isLoading: groupsLoading,
    error: groupsError,
    addGroup,
    editGroup,
    removeGroup,
  } = useGroups(disciplineId);
  const { teachers } = useTeachers();
  const { members } = useMembers();
  const { fees, addFee, editFee, removeFee } = useFees();

  const [activeTab, setActiveTab] = useState("groups");
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupFormError, setGroupFormError] = useState<string | null>(null);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  const [showFeeForm, setShowFeeForm] = useState(false);
  const [editingFee, setEditingFee] = useState<DisciplineFee | null>(null);
  const [feeFormError, setFeeFormError] = useState<string | null>(null);
  const [isSubmittingFee, setIsSubmittingFee] = useState(false);
  const [feeCategory, setFeeCategory] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [feeName, setFeeName] = useState("");

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const disciplineFees = fees.filter((f) => f.disciplineId === disciplineId);

  const handleAddGroup = async (data: CreateGroupInput | UpdateGroupInput) => {
    if (!disciplineId) return;
    setIsSubmittingGroup(true);
    setGroupFormError(null);
    const payload = data as CreateGroupInput;
    const result = await addGroup(payload);
    setIsSubmittingGroup(false);
    if (result) {
      setShowGroupForm(false);
    } else {
      setGroupFormError(groupsError || "Error al crear grupo");
    }
  };

  const handleEditGroup = async (data: UpdateGroupInput) => {
    if (!editingGroup) return;
    setIsSubmittingGroup(true);
    setGroupFormError(null);
    const result = await editGroup(editingGroup.id, data);
    setIsSubmittingGroup(false);
    if (result) {
      setEditingGroup(null);
      setShowGroupForm(false);
    } else {
      setGroupFormError(groupsError || "Error al actualizar grupo");
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm("¿Eliminar este grupo?")) return;
    await removeGroup(groupId);
  };

  const handleAddFee = async () => {
    if (!disciplineId || !feeCategory || !feeAmount) return;
    setIsSubmittingFee(true);
    setFeeFormError(null);
    const result = await addFee({
      name: feeName || `${discipline?.name} ${feeCategory}`,
      amount: Number(feeAmount),
      category: feeCategory,
      disciplineId,
    });
    setIsSubmittingFee(false);
    if (result) {
      setShowFeeForm(false);
      setFeeName("");
      setFeeCategory("");
      setFeeAmount("");
      refetchDiscipline();
    } else {
      setFeeFormError("Error al crear arancel");
    }
  };

  const handleEditFee = async () => {
    if (!editingFee || !feeAmount) return;
    setIsSubmittingFee(true);
    setFeeFormError(null);
    const result = await editFee(editingFee.id, {
      amount: Number(feeAmount),
      name: feeName || editingFee.name,
    });
    setIsSubmittingFee(false);
    if (result) {
      setShowFeeForm(false);
      setEditingFee(null);
      setFeeName("");
      setFeeCategory("");
      setFeeAmount("");
      refetchDiscipline();
    } else {
      setFeeFormError("Error al actualizar arancel");
    }
  };

  const handleDeleteFee = async (feeId: number) => {
    if (!confirm("¿Eliminar este arancel?")) return;
    await removeFee(feeId);
    refetchDiscipline();
  };

  const openFeeCreate = () => {
    setEditingFee(null);
    setFeeFormError(null);
    setFeeName("");
    setFeeCategory("");
    setFeeAmount("");
    setShowFeeForm(true);
  };

  const openFeeEdit = (fee: DisciplineFee) => {
    setEditingFee(fee);
    setFeeFormError(null);
    setFeeName(fee.name);
    setFeeCategory(fee.category);
    setFeeAmount(String(fee.amount));
    setShowFeeForm(true);
  };

  const handleAssignMember = async () => {
    if (!selectedMemberId || !selectedGroupId) return;
    setIsAssigning(true);
    try {
      const group = groups.find((g) => String(g.id) === selectedGroupId);
      if (!group) return;
      // Llamar al endpoint de groups para inscribir
      const data = await apiFetch<{ autoAssignedFee?: { name: string; amount: number } }>(
        `/api/disciplines/groups/${group.id}/members`,
        {
        method: "POST",
        body: JSON.stringify({ memberId: Number(selectedMemberId) }),
        },
      );

      if (data.autoAssignedFee) {
        toast.success(
          `Socio inscrito. Se asignó automáticamente: ${data.autoAssignedFee.name} ($${Number(data.autoAssignedFee.amount).toFixed(2)})`
        );
      } else {
        toast.success("Socio inscrito. No hay arancel configurado para su categoría.");
      }
      setSelectedMemberId("");
      setSelectedGroupId("");
      refetchDiscipline();
    } catch (err: any) {
      toast.error(err.message || "Error al inscribir socio");
    } finally {
      setIsAssigning(false);
    }
  };

  if (disciplineLoading) {
    return (
      <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (disciplineError || !discipline) {
    return (
      <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
        <p className="text-destructive">
          {disciplineError || "Disciplina no encontrada"}
        </p>
        <Link
          to="/disciplines"
          className="text-sm text-muted-foreground hover:underline mt-2 inline-block"
        >
          <ArrowLeft data-icon="inline-start" />
          Volver a disciplinas
        </Link>
      </div>
    );
  }

  // Flatten all memberGroups from all groups for the "Inscripciones" tab
  const allEnrollments = groups.flatMap((g) =>
    (g as any).memberGroups?.map((mg: any) => ({
      ...mg,
      groupName: g.schedule,
      groupDays: g.days,
    })) ?? []
  );

  const selectedMember = members.find((m) => String(m.id) === selectedMemberId);
  const selectedGroup = groups.find((g) => String(g.id) === selectedGroupId);

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <Link
          to="/disciplines"
          className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft data-icon="inline-start" />
          Volver a disciplinas
        </Link>
        <h1 className="text-3xl font-light tracking-tight">
          {discipline.name}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {discipline.groupClasses.length} grupos ·{" "}
          {discipline.sportsFees?.length ?? 0} aranceles configurados
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="groups">Grupos</TabsTrigger>
          <TabsTrigger value="fees">Aranceles</TabsTrigger>
          <TabsTrigger value="enrollments">Inscripciones</TabsTrigger>
        </TabsList>

        {/* ===== Tab: Grupos ===== */}
        <TabsContent value="groups" className="space-y-6">
          <div className="flex items-center justify-between">
            <div />
            <Button onClick={() => setShowGroupForm(true)} variant="outline">
              <Plus data-icon="inline-start" />
              Nuevo Grupo
            </Button>
          </div>

          <AnimatePresence>
            {showGroupForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">
                      {editingGroup ? "Editar Grupo" : "Nuevo Grupo"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GroupForm
                      group={editingGroup}
                      teachers={teachers}
                      onSubmit={editingGroup ? handleEditGroup : handleAddGroup}
                      onCancel={() => {
                        setShowGroupForm(false);
                        setEditingGroup(null);
                      }}
                      isLoading={isSubmittingGroup}
                      error={groupFormError}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Card>
            <CardContent className="pt-6">
              <GroupList
                groups={groups}
                isLoading={groupsLoading}
                error={groupsError}
                onEdit={(g) => {
                  setEditingGroup(g);
                  setShowGroupForm(true);
                }}
                onDelete={handleDeleteGroup}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Tab: Aranceles ===== */}
        <TabsContent value="fees" className="space-y-6">
          <div className="flex items-center justify-between">
            <div />
            <Button onClick={openFeeCreate} variant="outline">
              <Plus data-icon="inline-start" />
              Configurar Arancel
            </Button>
          </div>

          <AnimatePresence>
            {showFeeForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">
                      {editingFee ? "Editar Arancel" : "Nuevo Arancel"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4 max-w-md">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="fee-name">Nombre (opcional)</Label>
                        <Input
                          id="fee-name"
                          placeholder={`${discipline.name} Juvenil`}
                          value={feeName}
                          onChange={(e) => setFeeName(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="fee-category">Categoría</Label>
                        <Select
                          value={feeCategory}
                          onValueChange={(v) => setFeeCategory(v || "")}
                          disabled={!!editingFee}
                        >
                          <SelectTrigger id="fee-category">
                            <SelectValue placeholder="Seleccionar categoría">
                              {feeCategory || "Seleccionar categoría"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="fee-amount">Monto ($)</Label>
                        <Input
                          id="fee-amount"
                          type="number"
                          step="0.01"
                          value={feeAmount}
                          onChange={(e) => setFeeAmount(e.target.value)}
                        />
                      </div>
                      {feeFormError && (
                        <Alert variant="destructive">
                          <AlertDescription>{feeFormError}</AlertDescription>
                        </Alert>
                      )}
                      <div className="flex gap-3">
                        <Button
                          onClick={editingFee ? handleEditFee : handleAddFee}
                          disabled={isSubmittingFee || !feeCategory || !feeAmount}
                          className="flex-1"
                        >
                          {isSubmittingFee && (
                            <Loader2
                              data-icon="inline-start"
                              className="animate-spin"
                            />
                          )}
                          {editingFee ? "Guardar" : "Crear"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowFeeForm(false);
                            setEditingFee(null);
                          }}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Aranceles por Categoría
              </CardTitle>
              <CardDescription>
                Al inscribir un socio, se asigna automáticamente el arancel que
                corresponda a su categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              {disciplineFees.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  <Receipt className="size-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">No hay aranceles configurados</p>
                  <p className="text-xs mt-1">
                    Configurá los montos para cada categoría
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {disciplineFees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell>
                            <Badge variant="outline">{fee.category}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {fee.name}
                          </TableCell>
                          <TableCell>
                            ${Number(fee.amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openFeeEdit(fee)}
                              >
                                <Pencil data-icon="inline-start" /> Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteFee(fee.id)}
                              >
                                <Trash2 data-icon="inline-start" /> Eliminar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Tab: Inscripciones ===== */}
        <TabsContent value="enrollments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Inscribir Socio
              </CardTitle>
              <CardDescription>
                Seleccioná un socio y un grupo. Se asignará el arancel
                automáticamente si está configurado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="flex flex-col gap-2">
                  <Label>Socio</Label>
                  <Select
                    value={selectedMemberId}
                    onValueChange={(v) => setSelectedMemberId(v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar socio...">
                        {selectedMember
                          ? `${selectedMember.firstName} ${selectedMember.lastName} (${selectedMember.dni})`
                          : "Seleccionar socio..."}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {members
                        .filter((m) => m.isActive)
                        .map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.firstName} {m.lastName} ({m.dni}) —{" "}
                            {m.category}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Grupo</Label>
                  <Select
                    value={selectedGroupId}
                    onValueChange={(v) => setSelectedGroupId(v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grupo...">
                        {selectedGroup
                          ? `${selectedGroup.schedule} (${selectedGroup.days})`
                          : "Seleccionar grupo..."}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.schedule} ({g.days}) —{" "}
                          {g.user.firstName} {g.user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAssignMember}
                  disabled={!selectedMemberId || !selectedGroupId || isAssigning}
                >
                  {isAssigning && (
                    <Loader2
                      data-icon="inline-start"
                      className="animate-spin"
                    />
                  )}
                  Inscribir
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Inscripciones Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allEnrollments.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  <Users className="size-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">No hay inscripciones</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Socio</TableHead>
                        <TableHead>DNI</TableHead>
                        <TableHead>Grupo</TableHead>
                        <TableHead>Horario</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allEnrollments.map((enrollment: any) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            {enrollment.member?.firstName}{" "}
                            {enrollment.member?.lastName}
                          </TableCell>
                          <TableCell>{enrollment.member?.dni}</TableCell>
                          <TableCell>
                            {enrollment.groupName || "—"}
                          </TableCell>
                          <TableCell>
                            {enrollment.groupDays || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
