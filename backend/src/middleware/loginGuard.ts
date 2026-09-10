import type { Request, Response, NextFunction } from "express";

const FAILED_ATTEMPTS = new Map<string, { count: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 5;

export function loginGuard(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  const record = FAILED_ATTEMPTS.get(ip);

  if (record && record.lockedUntil > now) {
    const remaining = Math.ceil((record.lockedUntil - now) / 1000 / 60);
    res.status(429).json({
      message: `Demasiados intentos fallidos. Intentá de nuevo en ${remaining} minuto${remaining > 1 ? "s" : ""}.`,
      code: "ACCOUNT_LOCKED",
    });
    return;
  }

  let patched = false;

  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    if (patched) return originalJson(body);
    patched = true;

    if (res.statusCode === 401) {
      const current = FAILED_ATTEMPTS.get(ip) || { count: 0, lockedUntil: 0 };
      current.count += 1;

      if (current.count >= MAX_ATTEMPTS) {
        current.lockedUntil = now + LOCKOUT_MINUTES * 60 * 1000;
        current.count = 0;
        FAILED_ATTEMPTS.set(ip, current);

        const lockedRecord = FAILED_ATTEMPTS.get(ip)!;
        const remaining = Math.ceil((lockedRecord.lockedUntil - now) / 1000 / 60);
        res.status(429);
        return originalJson({
          message: `Demasiados intentos fallidos. Intentá de nuevo en ${remaining} minuto${remaining > 1 ? "s" : ""}.`,
          code: "ACCOUNT_LOCKED",
        });
      }

      FAILED_ATTEMPTS.set(ip, current);
    } else if (res.statusCode < 400) {
      FAILED_ATTEMPTS.delete(ip);
    }

    return originalJson(body);
  };

  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of FAILED_ATTEMPTS.entries()) {
    if (record.lockedUntil > 0 && record.lockedUntil < now) {
      FAILED_ATTEMPTS.delete(ip);
    }
  }
}, 60 * 1000);
