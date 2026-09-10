/**
 * @fileoverview API de autenticación: login, registro, sesión actual y cierre de sesión.
 * Todas las funciones usan apiFetch internamente.
 */

import { apiFetch } from "@/lib/api";

/**
 * Datos del usuario autenticado retornados por el backend.
 */
export type User = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  role: { id: number; name: string };
  createdAt: string;
  updatedAt?: string;
};

type LoginResponse = {
  token: string;
  user: User;
};

type MeResponse = {
  user: User;
};

/**
 * Inicia sesión con usuario y contraseña.
 * No requiere token (skipAuth = true).
 *
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<LoginResponse>} Token JWT y datos del usuario
 *
 * @example
 * const { token, user } = await loginApi("juanp", "123456");
 */
export async function loginApi(username: string, password: string): Promise<LoginResponse> {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    skipAuth: true,
  });
}

/**
 * Registra un nuevo usuario en el sistema.
 * No requiere token (skipAuth = true).
 *
 * @param {Object} payload - Datos del nuevo usuario
 * @param {string} payload.firstName - Nombre
 * @param {string} payload.lastName - Apellido
 * @param {string} payload.username - Nombre de usuario único
 * @param {string} payload.email - Correo electrónico
 * @param {string} payload.password - Contraseña
 * @param {string} payload.confirmPassword - Confirmación de contraseña
 * @returns {Promise<User>} Datos del usuario creado
 */
export async function registerApi(payload: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<User> {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

/**
 * Obtiene los datos del usuario con sesión activa.
 * Usa el token JWT del localStorage.
 *
 * @returns {Promise<MeResponse>} Datos del usuario autenticado
 */
export async function meApi(): Promise<MeResponse> {
  return apiFetch("/api/auth/me");
}

/**
 * Cierra la sesión del usuario en el backend.
 *
 * @returns {Promise<{message: string}>} Confirmación de cierre de sesión
 */
export async function logoutApi(): Promise<{ message: string }> {
  return apiFetch("/api/auth/logout", { method: "POST" });
}

/**
 * Obtiene la lista completa de usuarios con sus roles.
 *
 * @returns {Promise<User[]>} Lista de usuarios
 */
export async function getUsersApi(): Promise<User[]> {
  return apiFetch("/api/auth/users");
}

