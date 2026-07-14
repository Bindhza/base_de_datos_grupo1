const API_URL = 'http://localhost:8000/api';

/**
 * Wrapper de fetch que agrega automáticamente el header Authorization
 * con el token guardado en localStorage. Úsalo para cualquier request
 * a un endpoint protegido con @login_requerido.
 */
export async function fetchAutenticado(path, opciones = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    ...opciones.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...opciones, headers });

  if (res.status === 401) {
    // Token vencido o inválido: limpiamos sesión local
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('rut');
    throw new Error('Sesión expirada, inicia sesión de nuevo');
  }

  if (res.status === 403) {
    throw new Error('No tienes permisos para esta acción');
  }

  return res;
}