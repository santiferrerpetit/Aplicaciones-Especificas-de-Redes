import assert from "node:assert/strict";
import test from "node:test";
import { createReservationSchema } from "./reservations.schema";

test("reservation schema rechaza intervalos invertidos", () => {
  const result = createReservationSchema.safeParse({
    facilityId: 1,
    startAt: "2026-09-10T20:00:00.000Z",
    endAt: "2026-09-10T19:00:00.000Z",
  });
  assert.equal(result.success, false);
});

test("reservation schema acepta un intervalo válido", () => {
  const result = createReservationSchema.parse({
    facilityId: "1",
    startAt: "2026-09-10T19:00:00.000Z",
    endAt: "2026-09-10T20:00:00.000Z",
  });
  assert.equal(result.facilityId, 1);
  assert.equal(result.startAt instanceof Date, true);
});
