import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAutenticado } from '../api';
import './ReporteDescuentos.css';

function ReporteDescuentos() {
  const [reporteDescuentos, setReporteDescuentos] = useState([]);
  const [cargandoReporte, setCargandoReporte] = useState(true);
  const [errorReporte, setErrorReporte] = useState(null);

  const formatearMoneda = (valor) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor || 0);

  useEffect(() => {
    fetchAutenticado('/productos/reporte-descuentos/')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el reporte de descuentos');
        return res.json();
      })
      .then((data) => setReporteDescuentos(data))
      .catch((err) => setErrorReporte(err.message))
      .finally(() => setCargandoReporte(false));
  }, []);

  if (cargandoReporte) return <p className="estado-info">Cargando reporte de descuentos...</p>;
  if (errorReporte) return <p className="estado-error">{errorReporte}</p>;

  return (
    <div className="contenedor-reporte-descuentos">
      <div className="encabezado-reporte">
        <h2>Reporte de Grandes Ofertas (≥ 30% Descuento)</h2>
        <p className="descripcion-reporte">
          Muestra los productos con ofertas (no necesariamente vigentes) cuyo descuento es igual o superior al 30%, calculando el precio final y el ahorro por unidad. Presiona un producto para ver su detalle.
        </p>
      </div>

      {reporteDescuentos.length === 0 ? (
        <p className="estado-info">No hay ofertas vigentes con descuento ≥ 30%.</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="tabla-reporte-descuentos">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th className="celda-derecha">Descuento</th>
                <th className="celda-derecha">Precio Normal</th>
                <th className="celda-derecha">Precio Oferta</th>
                <th className="celda-derecha">Ahorro Unitario</th>
              </tr>
            </thead>
            <tbody>
              {reporteDescuentos.map((o) => (
                <tr key={o.id_oferta} className="fila-producto-link">
                  <td className="col-sku">
                    <Link to={`/productos/${o.sku}`} className="link-detalle">
                      {o.sku}
                    </Link>
                  </td>
                  <td className="col-nombre">
                    <Link to={`/productos/${o.sku}`} className="link-detalle">
                      {o.nombre}
                    </Link>
                  </td>
                  <td className="celda-derecha destacado-descuento">-{o.descuento}%</td>
                  <td className="celda-derecha">{formatearMoneda(o.precio_normal)}</td>
                  <td className="celda-derecha precio-oferta">{formatearMoneda(o.precio_con_descuento)}</td>
                  <td className="celda-derecha destacado-ahorro">{formatearMoneda(o.ahorro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ReporteDescuentos;
