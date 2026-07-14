import { useEffect, useState } from 'react';
import { fetchAutenticado } from '../api';
import './VariacionPrecios.css';

function VariacionPrecios() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAutenticado('/productos/variacion-precios/')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el reporte de variación de precios');
        return res.json();
      })
      .then((data) => setDatos(data))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(valor) || 0);
  };

  if (cargando) return <p className="estado-info">Cargando reporte...</p>;
  if (error) return <p className="estado-error">{error}</p>;
  if (datos.length === 0) return <p className="estado-info">No hay suficientes registros de cambios de precio.</p>;

  return (
    <div className="contenedor-variacion">
      <div className="encabezado-reporte">
        <h2>Historial de Variación de Precios</h2>
        <p className="descripcion-reporte">
          Muestra los productos cuyo precio de venta ha sido modificado, ordenados por su porcentaje de variación histórica.
        </p>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-variacion">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th className="celda-centro">Cant. Precios Históricos</th>
              <th className="celda-derecha">Precio Mínimo</th>
              <th className="celda-derecha">Precio Máximo</th>
              <th className="celda-derecha">Variación (%)</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((producto) => (
              <tr key={producto.sku}>
                <td className="col-sku">{producto.sku}</td>
                <td className="col-nombre">{producto.nombre}</td>
                <td className="celda-centro">{producto.numero_precios}</td>
                <td className="celda-derecha col-min">{formatearMoneda(producto.precio_min)}</td>
                <td className="celda-derecha col-max">{formatearMoneda(producto.precio_max)}</td>
                <td className="celda-derecha col-variacion">
                  <span className={`badge-variacion ${Number(producto.variacion_pct) > 0 ? 'positiva' : 'negativa'}`}>
                    {producto.variacion_pct > 0 ? '+' : ''}{producto.variacion_pct}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VariacionPrecios;
