import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas peticiones. Intentá de nuevo en un minuto.", code: "RATE_LIMIT_EXCEEDED" },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas subidas. Intentá de nuevo en un minuto.", code: "UPLOAD_LIMIT_EXCEEDED" },
});

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados intentos de inicio de sesión. Intentá de nuevo en un minuto.", code: "LOGIN_LIMIT_EXCEEDED" },
  skipSuccessfulRequests: true,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados registros. Intentá de nuevo en un minuto.", code: "REGISTER_LIMIT_EXCEEDED" },
});
