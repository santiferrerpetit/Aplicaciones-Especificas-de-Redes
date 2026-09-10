/**
 * @fileoverview Cliente HTTP centralizado para comunicación con el backend.
 * Maneja autenticación JWT automática, errores y cierre de sesión por 401.
 * Todos los módulos de API usan esta función como base.
 */

/** URL base del servidor backend. Detecta automáticamente si está en local o en producción. */
export const API_BASE = window.location.pathname.startsWith("/~")
  ? `/${window.location.pathname.split("/")[1]}`
  : window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3001"
    : `http://${window.location.hostname}:3001`;

/**
 * Opciones extendidas para apiFetch.
 */
interface ApiOptions extends RequestInit {
  /** Si es true, no adjunta el token JWT en el header */
  skipAuth?: boolean;
}

/**
 * Error de API con metadatos de estado HTTP.
 */
interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Función genérica para realizar peticiones HTTP al backend.
 * Adjunta automáticamente el token JWT y maneja errores 401 (sesión expirada).
 * Si el body es FormData, omite Content-Type (fetch lo setea con boundary).
 *
 * @template T - Tipo de dato esperado en la respuesta
 * @param {string} path - Ruta relativa a API_BASE (ej: "/api/auth/me")
 * @param {ApiOptions} [options={}] - Opciones de fetch (method, body, headers, skipAuth)
 * @returns {Promise<T>} Datos parseados de la respuesta
 * @throws {ApiError} Error con statusCode y code cuando la petición falla
 */
export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = localStorage.getItem("token");
  if (token && !options.skipAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json().catch(() => ({})) : {};

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth:logout"));
    throw Object.assign(new Error(data.message || "Sesión expirada. Por favor inicia sesión nuevamente."), {
      statusCode: 401,
      code: data.code || "UNAUTHORIZED",
    } as ApiError);
  }

  if (!response.ok) {
    throw Object.assign(new Error(data.message || "Error en la petición"), {
      statusCode: response.status,
      code: data.code || "REQUEST_ERROR",
    } as ApiError);
  }

  return data as T;
}
