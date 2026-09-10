import { useCallback, useEffect, useState } from "react";
import {
  cancelReservation,
  createReservation,
  getReservableFacilities,
  getReservations,
  updateReservation,
  type CreateReservationInput,
  type Facility,
  type Reservation,
} from "../api/reservationsApi";

export function useReservations(from: string, to: string) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [nextReservations, nextFacilities] = await Promise.all([
        getReservations({ from, to }),
        getReservableFacilities(),
      ]);
      setReservations(nextReservations);
      setFacilities(nextFacilities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las reservas");
    } finally {
      setIsLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addReservation = async (data: CreateReservationInput) => {
    try {
      const reservation = await createReservation(data);
      await refresh();
      return reservation;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la reserva");
      return null;
    }
  };

  const editReservation = async (id: number, data: Partial<CreateReservationInput>) => {
    try {
      const reservation = await updateReservation(id, data);
      await refresh();
      return reservation;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la reserva");
      return null;
    }
  };

  const removeReservation = async (id: number) => {
    try {
      await cancelReservation(id);
      await refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cancelar la reserva");
      return false;
    }
  };

  return { reservations, facilities, isLoading, error, refresh, addReservation, editReservation, removeReservation };
}
