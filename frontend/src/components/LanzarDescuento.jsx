import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchAutenticado } from '../api';
import './LanzarDescuento.css';

const obtenerFechaHoraMinima = () => {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  return `${anio}-${mes}-${dia}T${horas}:${minutos}`;
};

function LanzarDescuento() {
  const location = useLocation();
  const getInitialSku = () => {
    if (location.state?.sku) return location.state.sku;
    const params = new URLSearchParams(location.search);
    return params.get('sku') || '';
  };

  const [porcentaje, setPorcentaje] = useState('');
  const [sku, setSku] = useState(getInitialSku());
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(obtenerFechaHoraMinima());
  const [fechaFin, setFechaFin] = useState('');
  const [descripcionProducto, setDescripcionProducto] = useState('');
  const [precioProducto, setPrecioProducto] = useState('');

  useEffect(() => {
    const initialSku = getInitialSku();
    if (initialSku) {
      obtenerInfoProducto(null, initialSku);
    }
  }, []);

  function manejarCambioPorcentaje(evento) {
    const valor = evento.target.value;
    if (valor === '') {
      setPorcentaje('');
      return;
    }
    const num = parseInt(valor, 10);
    if (isNaN(num)) {
      setPorcentaje('');
    } else if (num > 100) {
      setPorcentaje('100');
    } else if (num < 1) {
      setPorcentaje('1');
    } else {
      setPorcentaje(num.toString());
    }
  }

  function manejarCambioSku(evento) {
    setSku(evento.target.value);
  }
  function manejarCambioFechaInicio(evento) {
    setFechaInicio(evento.target.value);
  }

  function manejarCambioFechaFin(evento) {
    setFechaFin(evento.target.value);
  }


  async function obtenerInfoProducto(evento, sku) {
    if (!sku) return;
    setError(null);
    try {
      const res = await fetchAutenticado(`/productos/obtener_producto/${sku}/`);
      const data = await res.json();
      if (res.ok) {
        // Guardamos los datos para mostrarlos en el HTML
        setDescripcionProducto(data.descripcion || data.nombre || 'Sin descripción');
        setPrecioProducto(data.precio_venta || '0');
      } else {
        setDescripcionProducto('');
        setPrecioProducto('');
        setError(data.error || 'Producto no encontrado');
      }
    } catch (err) {
      setDescripcionProducto('');
      setPrecioProducto('');
      setError(err.message);
    }
  }


  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError(null);
    setExito(false);
    setCargando(true);

    try {
      const fechaInicioConSegundos = `${fechaInicio.replace('T', ' ')}:00`;
      const fechaFinConSegundos = `${fechaFin.replace('T', ' ')}:00`;

      const res = await fetchAutenticado('/productos/lanzar_descuento/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          fecha_inicio: fechaInicioConSegundos,
          descuento: porcentaje,
          fecha_fin: fechaFinConSegundos,
          sku,
          rut: location.state?.rut || localStorage.getItem('rut'),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al lanzar el descuento');
      }

      setExito(true);
      setPorcentaje('');
      setSku('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="discount-contenedor">
      <form className="discount-form" onSubmit={manejarSubmit}>
        <h1>Lanzar Descuento</h1>

        {error && <p className="discount-error">{error}</p>}
        {exito && <p className="discount-exito">¡Descuento lanzado exitosamente!</p>}

        <label className="discount-porcent-label">
          PORCENTAJE DE DESCUENTO A APLICAR
          <div className="discount-input-group">
            <input
              type="number"
              value={porcentaje}
              onChange={manejarCambioPorcentaje}
              placeholder="Ej. 50"
              min="1"
              max="100"
              required
              disabled={cargando}
            />
            <span className="discount-addon">%</span>
          </div>
        </label>

        <label className="sku-label">
          SKU DEL PRODUCTO
          <input
            type="number"
            value={sku}
            onChange={manejarCambioSku}
            placeholder="SKU"
            min="0"
            required
            disabled={cargando}
            onBlur={(evento) => obtenerInfoProducto(evento, sku)}
          />
        </label>

        <label className="fecha-inicio-label">
          FECHA DE INICIO
          <input
            type="datetime-local"
            value={fechaInicio}
            onChange={manejarCambioFechaInicio}
            required
            min={obtenerFechaHoraMinima()}
            disabled={cargando}
          />
        </label>

        <label className="fecha-fin-label">
          FECHA DE FIN
          <input
            type="datetime-local"
            value={fechaFin}
            onChange={manejarCambioFechaFin}
            required
            min={fechaInicio}
            disabled={cargando}
          />
        </label>


        <label>
          <p>Producto: {descripcionProducto == '' ? 'Ingrese un SKU valido' : descripcionProducto}</p>
          <p>Precio: {precioProducto == '' ? 'Ingrese un SKU valido' : precioProducto}</p>
          <p>Precio final: {(precioProducto && porcentaje) ? (parseInt(parseInt(precioProducto) - (parseInt(precioProducto) * parseInt(porcentaje)) / 100)) : '-'}</p>
        </label>

        {/*condiciones de validacion para activar el boton*/}
        <button type="submit" className="discount-boton" disabled={descripcionProducto == 'Sin descripción' || descripcionProducto == '' || precioProducto == '' || precioProducto == '0' || porcentaje == '' || porcentaje == '0' || fechaInicio == '' || fechaFin == '' || fechaFin < fechaInicio || porcentaje > 100 || porcentaje < 1}>
          {cargando ? 'Lanzando descuento...' : 'Lanzar Descuento'}
        </button>
      </form>
    </div>
  );
}

export default LanzarDescuento;