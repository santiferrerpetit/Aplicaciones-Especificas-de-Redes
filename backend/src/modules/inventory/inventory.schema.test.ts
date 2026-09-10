import assert from "node:assert/strict";
import test from "node:test";
import { createInventorySchema, createLoanSchema } from "./inventory.schema";

test("inventory schema normaliza valores numéricos", () => {
  const result = createInventorySchema.parse({ name: "Conos", totalQuantity: "12", minimumQuantity: "2" });
  assert.equal(result.totalQuantity, 12);
  assert.equal(result.minimumQuantity, 2);
});

test("loan schema rechaza una cantidad inválida", () => {
  const result = createLoanSchema.safeParse({ quantity: 0 });
  assert.equal(result.success, false);
});
