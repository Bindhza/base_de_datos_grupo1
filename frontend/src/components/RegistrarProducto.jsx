import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAutenticado } from '../api';
import { formatearPrecio } from '../utils/FormatoPrecio';
import './RegistroForm.css';

const API_URL = 'http://localhost:8000/api';
const HOY = new Date().toISOString().split('T')[0];

function RegistrarProducto() {
  const [sku, setSku] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [urlImagen, setUrlImagen] = useState('');
  const [idMarca, setIdMarca] = useState('');
  const [cantidadCompra, setCantidadCompra] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');  
  const [fechaCompra, setFechaCompra] = useState('');
  const [idCategoria, setIdCategoria] = useState('');

  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);

  const [marcas, setMarcas] = useState([]);
  const [cargandoMarcas, setCargandoMarcas] = useState(true);

  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/productos/categorias`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron cargar las categorías');
        return res.json();
      })
      .then((data) => {
        setCategorias(data);
        if (data.length > 0) {
          setIdCategoria(String(data[0].id_categoria));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargandoCategorias(false));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/productos/marcas`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron cargar las marcas');
        return res.json();
      })
      .then((data) => {
        setMarcas(data);
        if (data.length > 0) {
          setIdMarca(String(data[0].id_marca));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargandoMarcas(false));
  }, []);

  function manejarCambioSku(evento) {
    const soloDigitos = evento.target.value.replace(/\D/g, '').slice(0, 4);
    setSku(soloDigitos);
  }

  function manejarCambioCantidadCompra(evento) {
    const soloDigitos = evento.target.value.replace(/\D/g, '');
    setCantidadCompra(soloDigitos);
  }

  function manejarCambioPrecioCompra(evento) {
    const soloDigitos = evento.target.value.replace(/\D/g, '');
    setPrecioCompra(soloDigitos);
  }
  function manejarCambioPrecioVenta(evento) {
    const soloDigitos = evento.target.value.replace(/\D/g, '');
    setPrecioVenta(soloDigitos);
  }

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError(null);

    if (sku.length !== 4) {
      setError('El SKU debe tener exactamente 4 dígitos');
      return;
    }

    if (!idCategoria) {
      setError('Selecciona una categoría');
      return;
    }

    if (!idMarca) {
      setError('Selecciona una marca');
      return;
    }
    if (cantidadCompra <= 0) {
      setError('Ingresa una cantidad de compra válida');
      return;
    }
    if (precioCompra <= 0) {
      setError('Ingresa un precio de compra válido');
      return;
    }
    if (precioVenta <= 0) {
      setError('Ingresa un precio de venta válido');
      return;
    }


    if (!fechaCompra) {
      setError('Selecciona la fecha de compra');
      return;
    }

    setCargando(true);

    try {
      const res = await fetchAutenticado('/productos/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          sku,
          nombre,
          descripcion,
          url_imagen: urlImagen,
          id_marca: idMarca,
          cantidad_compra: cantidadCompra || '0',
          id_categoria: idCategoria,
          precio_compra: precioCompra,
          precio_venta: precioVenta,
          fecha_compra: fechaCompra,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo registrar el producto');
      }

      setExito(true);
      setSku('');
      setNombre('');
      setDescripcion('');
      setUrlImagen('');
      setCantidadCompra('');
      setPrecioCompra('');
      setPrecioVenta('');
      setFechaCompra('');
      if (marcas.length > 0) {
        setIdMarca(String(marcas[0].id_marca));
      }
      if (categorias.length > 0) {
        setIdCategoria(String(categorias[0].id_categoria));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="registro-contenedor">
      <form className="registro-form" onSubmit={manejarSubmit}>
        <h1>Registrar producto</h1>

        <label className="registro-label">
          SKU
          <input
            type="text"
            inputMode="numeric"
            value={sku}
            onChange={manejarCambioSku}
            placeholder="1010"
            maxLength={4}
            required
          />
        </label>

        <label className="registro-label">
          Nombre
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Aceite engranajes 80W-90 1L"
            maxLength={30}
            required
          />
        </label>

        <label className="registro-label">
          Descripción
          <textarea
            className="registro-textarea-fija"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Detalle del producto (opcional)"
            maxLength={300}
          />
        </label>

        <label className="registro-label">
          URL de imagen
          <input
            type="url"
            value={urlImagen}
            onChange={(e) => setUrlImagen(e.target.value)}
            placeholder="https://lubrishell.cl/img/1010.jpg"
            required
          />
        </label>

        <label className="registro-label">
          Marca
          <select
            value={idMarca}
            onChange={(e) => setIdMarca(e.target.value)}
            disabled={cargandoMarcas || marcas.length === 0}
            required
          >
            {cargandoMarcas && <option value="">Cargando marcas...</option>}
            {!cargandoMarcas && marcas.length === 0 && (
              <option value="">No hay marcas disponibles</option>
            )}
            {marcas.map((m) => (
              <option key={m.id_marca} value={m.id_marca}>
                {m.nombre_marca}
              </option>
            ))}
          </select>
          <p className="registro-nota">
            ¿No encuentras la marca?{' '}
            <Link to="/productos/marcas/registrar">Regístrala acá</Link>
          </p>
        </label>

        <label className="registro-label">
          Cantidad comprada (unidades)
          <input
            type="text"
            inputMode="numeric"
            value={cantidadCompra}
            onChange={manejarCambioCantidadCompra}
            placeholder="0"
            required
          />
        </label>

        <label className="registro-label">
          Precio de compra
          <input
            type="text"
            inputMode="numeric"
            value={formatearPrecio(precioCompra)}
            onChange={manejarCambioPrecioCompra}
            placeholder="10.000"
            required
          />
        </label>



        <label className="registro-label">
          Fecha de compra
          <input
            type="date"
            value={fechaCompra}
            onChange={(e) => setFechaCompra(e.target.value)}
            max={HOY}
            required
          />
        </label>

        <label className="registro-label">
          Precio de venta (por unidad)
          <input
            type="text"
            inputMode="numeric"
            value={formatearPrecio(precioVenta)}
            onChange={manejarCambioPrecioVenta}
            placeholder="15.000"
            required
          />
        </label>

        <label className="registro-label">
          Categoría
          <select
            value={idCategoria}
            onChange={(e) => setIdCategoria(e.target.value)}
            disabled={cargandoCategorias || categorias.length === 0}
            required
          >
            {cargandoCategorias && <option value="">Cargando categorías...</option>}
            {!cargandoCategorias && categorias.length === 0 && (
              <option value="">No hay categorías disponibles</option>
            )}
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="registro-error">{error}</p>}
        {exito && <p className="registro-exito">¡Producto registrado correctamente!</p>}

        <button
          type="submit"
          className="registro-boton"
          disabled={cargando || cargandoCategorias || cargandoMarcas}
        >
          {cargando ? 'Registrando...' : 'Registrar producto'}
        </button>
      </form>
    </div>
  );
}

export default RegistrarProducto;