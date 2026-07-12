import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAutenticado } from '../api';
import './RegistroForm.css';

function RegistrarMarca() {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError('Ingresá el nombre de la marca');
      return;
    }

    setCargando(true);

    try {
      const res = await fetchAutenticado('/productos/marcas/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ nombre }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo registrar la marca');
      }

      setExito(true);
      setNombre('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="registro-contenedor">
      <form className="registro-form" onSubmit={manejarSubmit}>
        <h1>Registrar marca</h1>

        <label className="registro-label">
          Nombre
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Mobil"
            maxLength={30}
            required
          />
        </label>

        {error && <p className="registro-error">{error}</p>}
        {exito && (
          <p className="registro-exito">
            ¡Marca registrada! Ya podés seleccionarla al registrar un producto.
          </p>
        )}

        <button type="submit" className="registro-boton" disabled={cargando}>
          {cargando ? 'Registrando...' : 'Registrar marca'}
        </button>

        <p className="registro-nota">
          <Link to="/productos/crear">← Volver a registrar producto</Link>
        </p>
      </form>
    </div>
  );
}

export default RegistrarMarca;