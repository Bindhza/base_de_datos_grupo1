import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SelectorFecha from '../utils/SelectorFecha';
import { formatearRut } from '../utils/FormatoRut';
import { fetchAutenticado } from '../api';
import './RegistroForm.css';

const ROLES = [
  { valor: 'vendedor', etiqueta: 'Vendedor' },
  { valor: 'jefe_bodega', etiqueta: 'Jefe de Bodega' },
  { valor: 'administrador', etiqueta: 'Administrador' },
];

function RegistrarPersonal() {
  const [rut, setRut] = useState('');
  const [telefonoLocal, setTelefonoLocal] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(null);
  const [rol, setRol] = useState('');

  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  function manejarCambioRut(evento) {
    setRut(formatearRut(evento.target.value));
  }

  function manejarCambioTelefono(evento) {
    const soloDigitos = evento.target.value.replace(/\D/g, '').slice(0, 8);
    setTelefonoLocal(soloDigitos);
  }

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError(null);

    if (!fechaNacimiento) {
      setError('Selecciona la fecha de nacimiento completa');
      return;
    }

    if (telefonoLocal.length !== 8) {
      setError('El número telefónico debe tener 8 dígitos');
      return;
    }

    if (!rol) {
      setError('Selecciona un rol');
      return;
    }

    setCargando(true);

    try {
      const res = await fetchAutenticado('/registrar_personal/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          rut,
          numero_telefonico: `+569${telefonoLocal}`,
          correo_electronico: correoElectronico,
          contrasena,
          fecha_nacimiento: fechaNacimiento,
          rol,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo registrar el personal');
      }

      setExito(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="registro-contenedor">
      <form className="registro-form" onSubmit={manejarSubmit}>
        <h1>Registrar personal</h1>

        <label className="registro-label">
          RUT
          <input
            type="text"
            value={rut}
            onChange={manejarCambioRut}
            placeholder="12.345.678-9"
            maxLength={12}
            required
          />
        </label>

        <label className="registro-label">
          Número telefónico
          <div className="telefono-grupo">
            <span className="telefono-prefijo">+569</span>
            <input
              type="text"
              inputMode="numeric"
              value={telefonoLocal}
              onChange={manejarCambioTelefono}
              placeholder="12345678"
              maxLength={8}
              required
            />
          </div>
        </label>

        <label className="registro-label">
          Correo electrónico
          <input
            type="email"
            value={correoElectronico}
            onChange={(e) => setCorreoElectronico(e.target.value)}
            placeholder="tucorreo@mail.com"
            required
          />
        </label>

        <label className="registro-label">
          Contraseña
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </label>

        <label className="registro-label">
          Fecha de nacimiento
          <SelectorFecha onChange={setFechaNacimiento} />
        </label>

        <label className="registro-label">
          Rol
          <select value={rol} onChange={(e) => setRol(e.target.value)} required>
            <option value="">Selecciona un rol</option>
            {ROLES.map((r) => (
              <option key={r.valor} value={r.valor}>{r.etiqueta}</option>
            ))}
          </select>
        </label>

        {error && <p className="registro-error">{error}</p>}
        {exito && <p className="registro-exito">¡Personal registrado! Redirigiendo...</p>}

        <button type="submit" className="registro-boton" disabled={cargando}>
          {cargando ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
}

export default RegistrarPersonal;