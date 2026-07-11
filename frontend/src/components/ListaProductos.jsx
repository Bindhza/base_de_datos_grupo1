import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ListaProductos.css';

const API_URL = 'http://localhost:8000/api/productos/';

function ListaProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el catálogo');
        return res.json();
      })
      .then((data) => setProductos(data))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p className="estado-info">Cargando productos...</p>;
  if (error) return <p className="estado-error">{error}</p>;
  if (productos.length === 0) return <p className="estado-info">No hay productos disponibles.</p>;

  return (
    <div className="grid-productos">
      {productos.map((producto) => (
        <Link
          key={producto.sku}
          to={`/productos/${producto.sku}`}
          className="card-producto"
        >
          <div className="card-producto-imagen">
            {producto.url_imagen ? (
              <img src={producto.url_imagen} alt={producto.nombre} loading="lazy" />
            ) : (
              <div className="sin-imagen">Sin imagen</div>
            )}
            {producto.stock === 0 && (
              <span className="badge-agotado">Agotado</span>
            )}
          </div>
          <div className="card-producto-info">
            <span className="card-producto-marca">{producto.marca}</span>
            <h3 className="card-producto-nombre">{producto.nombre}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default ListaProductos;