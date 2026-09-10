import assert from "node:assert/strict";
import test from "node:test";
import { requireRoles } from "./roles";

test("requireRoles permite un rol autorizado", () => {
  let called = false;
  const middleware = requireRoles("Administrator");
  middleware(
    { user: { roleName: "Administrator" } } as any,
    {} as any,
    () => {
      called = true;
    },
  );

  assert.equal(called, true);
});

test("requireRoles rechaza un rol no autorizado", () => {
  let statusCode = 0;
  let body: unknown;
  const middleware = requireRoles("Maintenance");
  middleware(
    { user: { roleName: "Professor" } } as any,
    {
      status(code: number) {
        statusCode = code;
        return { json(value: unknown) { body = value; } };
      },
    } as any,
    () => assert.fail("No debe llamar next"),
  );

  assert.equal(statusCode, 403);
  assert.deepEqual(body, { message: "Acceso denegado para el rol actual", code: "FORBIDDEN" });
});
