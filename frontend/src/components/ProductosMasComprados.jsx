import { useEffect, useState } from 'react';
import { fetchAutenticado } from '../api';
import './ProductosMasComprados.css';

function ProductosMasComprados() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAutenticado('/productos/mas-comprados/')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el reporte de productos más comprados');
        return res.json();
      })
      .then((data) => setDatos(data))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p className="estado-info">Cargando reporte...</p>;
  if (error) return <p className="estado-error">{error}</p>;
  if (datos.length === 0) return <p className="estado-info">No hay registros de compras.</p>;

  return (
    <div className="contenedor-mas-comprados">
      <div className="encabezado-reporte">
        <h2>Top Productos Más Comprados (Re-abastecimiento)</h2>
        <p className="descripcion-reporte">
          Muestra los 10 productos que más unidades han sido compradas a proveedores por la empresa.
        </p>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-mas-comprados">
          <thead>
            <tr>
              <th>Ranking</th>
              <th>SKU</th>
              <th>Producto</th>
              <th className="celda-derecha">Total Unidades Compradas</th>
              <th className="celda-centro">Frecuencia (N° Compras)</th>
              <th className="celda-derecha">Promedio por Compra</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((producto, index) => (
              <tr key={producto.sku}>
                <td className="col-ranking">#{index + 1}</td>
                <td className="col-sku">{producto.sku}</td>
                <td className="col-nombre">{producto.nombre}</td>
                <td className="celda-derecha col-total">
                  {producto.total_comprado} unds.
                </td>
                <td className="celda-centro">{producto.numero_compras}</td>
                <td className="celda-derecha col-promedio">
                  {producto.promedio_por_compra} unds.
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductosMasComprados;
