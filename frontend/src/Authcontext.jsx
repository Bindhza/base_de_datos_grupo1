import { useState } from 'react';
import { AuthContext } from './authContextObject';

const API_URL = 'http://localhost:8000/api';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [rol, setRol] = useState(() => localStorage.getItem('rol'));
  const [rut, setRut] = useState(() => localStorage.getItem('rut'));
  const [nombre, setNombre] = useState(() => localStorage.getItem('nombre'));
  const [apellido, setApellido] = useState(() => localStorage.getItem('apellido'));

  async function login(rutIngresado, contrasena) {
    const res = await fetch(`${API_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ rut: rutIngresado, contrasena }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'No se pudo iniciar sesión');
    }

    const data = await res.json();

    localStorage.setItem('token', data.token);
    localStorage.setItem('rol', data.rol);
    localStorage.setItem('rut', rutIngresado);
    localStorage.setItem('nombre', data.nombre);
    localStorage.setItem('apellido', data.apellido)
    setToken(data.token);
    setRol(data.rol);
    setRut(rutIngresado);
    setNombre(data.nombre);
    setNombre(data.apellido);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('rut');
    localStorage.removeItem('nombre');
    localStorage.removeItem('apellido');
    setToken(null);
    setRol(null);
    setRut(null);
    setNombre(null);
    setApellido(null);
  }

  const estaLogueado = Boolean(token);

  return (
    <AuthContext.Provider value={{ token, rol, rut, nombre, apellido, estaLogueado, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}