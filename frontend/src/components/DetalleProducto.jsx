import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';
import { useCart } from '../context/CartContext';
import './DetalleProducto.css';

const API_URL = 'http://localhost:8000/api/productos';

function DetalleProducto() {
  const { sku } = useParams();
  return <DetalleProductoInterno key={sku} sku={sku} />;
}

function DetalleProductoInterno({ sku }) {
  const { rol, token, rut, estaLogueado } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el formulario de precio
  const [precioVentaInput, setPrecioVentaInput] = useState('');
  const [actualizandoPrecio, setActualizandoPrecio] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [errorPrecio, setErrorPrecio] = useState(null);

  // Estados para el formulario de compra
  const [cantidadCompra, setCantidadCompra] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [fechaCompra, setFechaCompra] = useState('');
  const [registrandoCompra, setRegistrandoCompra] = useState(false);
  const [mensajeExitoCompra, setMensajeExitoCompra] = useState(null);
  const [errorCompra, setErrorCompra] = useState(null);

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

  const manejarActualizarPrecio = async (e) => {
    e.preventDefault();
    setActualizandoPrecio(true);
    setMensajeExito(null);
    setErrorPrecio(null);

    try {
      const res = await fetch(`${API_URL}/${sku}/actualizar_precio/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ precio_venta: Number(precioVentaInput) })
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar el precio');
      }

      setMensajeExito(data.mensaje || 'Precio actualizado correctamente');
      setProducto((prev) => ({ ...prev, precio: Number(precioVentaInput) }));
      setPrecioVentaInput('');
    } catch (err) {
      setErrorPrecio(err.message);
    } finally {
      setActualizandoPrecio(false);
    }
  };

  const manejarRegistrarCompra = async (e) => {
    e.preventDefault();
    setRegistrandoCompra(true);
    setMensajeExitoCompra(null);
    setErrorCompra(null);

    try {
      const res = await fetch(`${API_URL}/${sku}/compra/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cantidad: Number(cantidadCompra),
          precio_compra: Number(precioCompra),
          fecha_compra: fechaCompra
        })
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo registrar la compra');
      }

      setMensajeExitoCompra(data.mensaje || 'Compra registrada exitosamente');
      setProducto((prev) => ({ ...prev, stock: prev.stock + Number(cantidadCompra) }));
      setCantidadCompra('');
      setPrecioCompra('');
      setFechaCompra('');
    } catch (err) {
      setErrorCompra(err.message);
    } finally {
      setRegistrandoCompra(false);
    }
  };

  const [cantidadCarrito, setCantidadCarrito] = useState(1);

  const manejarAgregarCarrito = () => {
    addToCart(producto, cantidadCarrito);
    alert('Añadido al carrito');
  };

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

          <p className="detalle-producto-precio">
            Precio: {producto.precio ? `$${producto.precio}` : 'No definido'}
          </p>

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

          {producto.stock > 0 && estaLogueado && rol === 'cliente' && (
            <div className="agregar-carrito-seccion">
              <div className="selector-cantidad-moderno">
                <button 
                  className="btn-cantidad" 
                  onClick={() => setCantidadCarrito(Math.max(1, cantidadCarrito - 1))}
                  disabled={cantidadCarrito <= 1}
                >
                  -
                </button>
                <span className="valor-cantidad">{cantidadCarrito}</span>
                <button 
                  className="btn-cantidad" 
                  onClick={() => setCantidadCarrito(Math.min(producto.stock, cantidadCarrito + 1))}
                  disabled={cantidadCarrito >= producto.stock}
                >
                  +
                </button>
              </div>
              <button className="boton-agregar" onClick={manejarAgregarCarrito}>
                Agregar al carrito
              </button>
            </div>
          )}
          
        </div>
      </div>

      {(rol === 'jefe_bodega' || rol === 'administrador') && (
        <div className="admin-panel">
          <div className="admin-panel-grid">
            <div className="admin-seccion">
              <h3>Registrar Ingreso de Stock</h3>
              <form onSubmit={manejarRegistrarCompra} className="admin-form">
                <label>
                  Cantidad:
                  <input
                    type="number"
                    min="1"
                    value={cantidadCompra}
                    onChange={(e) => setCantidadCompra(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Precio de Compra (c/u):
                  <input
                    type="number"
                    min="1"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Fecha de Compra:
                  <input
                    type="date"
                    value={fechaCompra}
                    onChange={(e) => setFechaCompra(e.target.value)}
                    required
                  />
                </label>
                <button type="submit" disabled={registrandoCompra} className="admin-boton">
                  {registrandoCompra ? 'Registrando...' : 'Registrar Compra'}
                </button>
              </form>
              {errorCompra && <p className="admin-error">{errorCompra}</p>}
              {mensajeExitoCompra && <p className="admin-exito">{mensajeExitoCompra}</p>}
            </div>

            <div className="admin-seccion">
              <h3>Actualizar Precio de Venta</h3>
              <form onSubmit={manejarActualizarPrecio} className="admin-form">
                <label>
                  Nuevo Precio de Venta:
                  <input
                    type="number"
                    min="1"
                    value={precioVentaInput}
                    onChange={(e) => setPrecioVentaInput(e.target.value)}
                    required
                    placeholder="Ej. 15000"
                  />
                </label>
                <button type="submit" disabled={actualizandoPrecio} className="admin-boton">
                  {actualizandoPrecio ? 'Actualizando...' : 'Actualizar Precio'}
                </button>
                <button
                  type="button"
                  className="boton-descuento"
                  onClick={() => navigate('/descuento', { state: { sku, rol, rut } })}
                >
                  Registrar un Descuento
                </button>
              </form>
              {errorPrecio && <p className="admin-error">{errorPrecio}</p>}
              {mensajeExito && <p className="admin-exito">{mensajeExito}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalleProducto;