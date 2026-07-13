import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './DetalleProducto.css';

const API_URL = 'http://localhost:8000/api/productos';

function DetalleProducto() {
  const { sku } = useParams();
  return <DetalleProductoInterno key={sku} sku={sku} />;
}

function DetalleProductoInterno({ sku }) {
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true); // ya arranca en true
  const [error, setError] = useState(null);        // ya arranca en null

  useEffect(() => {
    fetch(`${API_URL}/${sku}/`)
      .then((res) => {
        if (res.status === 404) throw new Error('Producto no encontrado');
        if (!res.ok) throw new Error('Ocurrió un error al cargar el producto');
        return res.json();
      })
      .then((data) => setProducto(data))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false)); 
  }, [sku]);

  if (cargando) return <p className="estado-info">Cargando producto...</p>;

  if (error) {
    return (
      <div className="detalle-error">
        <p className="estado-error">{error}</p>
        <Link to="/productos" className="volver-link">← Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="detalle-producto">
      <Link to="/productos" className="volver-link">← Volver al catálogo</Link>

      <div className="detalle-producto-contenido">
        <div className="detalle-producto-imagen">
          {producto.url_imagen ? (
            <img src={producto.url_imagen} alt={producto.nombre} />
          ) : (
            <div className="sin-imagen sin-imagen-grande">Sin imagen</div>
          )}
        </div>

        <div className="detalle-producto-info">
          <span className="detalle-producto-marca">{producto.marca}</span>
          <h1 className="detalle-producto-nombre">{producto.nombre}</h1>
          <p className="detalle-producto-sku">SKU: {producto.sku}</p>

          {producto.categoria && (
            <p className="detalle-producto-categoria">{producto.categoria}</p>
          )}

          {producto.descripcion && (
            <p className="detalle-producto-descripcion">{producto.descripcion}</p>
          )}

          <div className="detalle-producto-stock">
            {producto.stock > 0 ? (
              <span className="stock-disponible">
                {producto.stock} unidades disponibles
              </span>
            ) : (
              <span className="stock-agotado">Sin stock</span>
            )}
          </div>

          <button
            className="boton-agregar"
            disabled={producto.stock === 0}
          >
            {producto.stock > 0 ? 'Agregar al carrito' : 'No disponible'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetalleProducto;