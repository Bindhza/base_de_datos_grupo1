import { useEffect, useState } from 'react';
import { fetchAutenticado } from '../api';
import './InventarioInmovilizado.css';

function InventarioInmovilizado() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAutenticado('/productos/inmovilizado/')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el reporte de inventario inmovilizado');
        return res.json();
      })
      .then((data) => setDatos(data))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p className="estado-info">Cargando reporte de inventario...</p>;
  if (error) return <p className="estado-error">{error}</p>;
  if (datos.length === 0) return <p className="estado-info">No hay registros de inventario inmovilizado.</p>;

  // Calcular el gran total de dinero inmovilizado de todo el inventario
  const granTotalInmovilizado = datos.reduce(
    (acumulador, prod) => acumulador + Number(prod.dinero_inmovilizado || 0),
    0
  );

  // Formateador de moneda auxiliar
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(valor) || 0);
  };

  return (
    <div className="contenedor-inmovilizado">
      <div className="encabezado-reporte">
        <h2>Inventario Inmovilizado</h2>
        <div className="card-resumen">
          <span className="resumen-titulo">Total Capital Inmovilizado</span>
          <span className="resumen-valor">{formatearMoneda(granTotalInmovilizado)}</span>
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-inmovilizado">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th className="celda-derecha">Stock</th>
              <th className="celda-derecha">Precio Unitario</th>
              <th className="celda-derecha">Dinero Inmovilizado</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((producto) => (
              <tr key={producto.sku}>
                <td className="col-sku">{producto.sku}</td>
                <td className="col-nombre">{producto.nombre}</td>
                <td>
                  <span className="badge-categoria">{producto.categoria}</span>
                </td>
                <td className={`celda-derecha col-stock ${producto.stock === 0 ? 'sin-stock' : ''}`}>
                  {producto.stock}
                </td>
                <td className="celda-derecha">{formatearMoneda(producto.precio)}</td>
                <td className="celda-derecha col-inmovilizado">
                  {formatearMoneda(producto.dinero_inmovilizado)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventarioInmovilizado;