import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../useAuth';
import { useNavigate } from 'react-router-dom';
import { fetchAutenticado } from '../api';
import { formatearRut } from '../utils/FormatoRut';
import { comunasChile } from '../utils/comunasChile';
import './Checkout.css';

function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { estaLogueado, rol } = useAuth();
  const navigate = useNavigate();

  const [sucursales, setSucursales] = useState([]);
  const [cargandoSucursales, setCargandoSucursales] = useState(true);

  // Form state
  const [tipoEntrega, setTipoEntrega] = useState('entrega_en_sucursal');
  const [tipoDoc, setTipoDoc] = useState('boleta');
  const [metodoPago, setMetodoPago] = useState('debito');
  const [rutEmpresa, setRutEmpresa] = useState('');
  const [idSucursal, setIdSucursal] = useState('');
  const [comuna, setComuna] = useState('');
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  
  // Simulation and status
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!estaLogueado || rol !== 'cliente') {
      navigate('/login');
    }
  }, [estaLogueado, rol, navigate]);

  useEffect(() => {
    fetch('http://localhost:8000/api/sucursales/')
      .then(res => res.json())
      .then(data => {
        setSucursales(data);
        if (data.length > 0) setIdSucursal(data[0].id_sucursal);
        setCargandoSucursales(false);
      })
      .catch(err => {
        console.error(err);
        setCargandoSucursales(false);
      });
  }, []);

  const formatearMoneda = (valor) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor || 0);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (tipoDoc === 'factura' && !rutEmpresa) {
      setError('Debes ingresar el RUT de la empresa para solicitar factura.');
      return;
    }

    setProcesando(true);
    setError(null);

    // Simular el pago
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const res = await fetchAutenticado('/checkout/', {
        method: 'POST',
        body: JSON.stringify({
          carrito: cart.map(item => ({ sku: item.sku, cantidad: item.cantidad })),
          tipo_entrega: tipoEntrega,
          tipo_doc: tipoDoc,
          metodo_pago: metodoPago,
          rut_empresa: tipoDoc === 'factura' ? rutEmpresa : null,
          id_sucursal: tipoEntrega === 'entrega_en_sucursal' ? idSucursal : null,
          comuna: tipoEntrega === 'despacho_a_domicilio' ? comuna : null,
          calle: tipoEntrega === 'despacho_a_domicilio' ? calle : null,
          numero: tipoEntrega === 'despacho_a_domicilio' ? numero : null,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al procesar la compra.');
      }

      setMensaje('¡Compra realizada con éxito! Tu comprobante ha sido enviado.');
      clearCart();
      setTimeout(() => navigate('/productos'), 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  if (cart.length === 0 && !mensaje) {
    return <div className="checkout-vacio">No hay productos en tu carrito.</div>;
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Finalizar Compra</h1>

      {mensaje ? (
        <div className="mensaje-exito">{mensaje}</div>
      ) : (
        <div className="checkout-grid">
          <div className="checkout-form-section">
            <form onSubmit={manejarEnvio}>
              <div className="form-group-block">
                <h3>Método de Entrega</h3>
                <div className="radio-group">
                  <label>
                    <input type="radio" value="entrega_en_sucursal" checked={tipoEntrega === 'entrega_en_sucursal'} onChange={(e) => setTipoEntrega(e.target.value)} />
                    Retiro en Sucursal
                  </label>
                  <label>
                    <input type="radio" value="despacho_a_domicilio" checked={tipoEntrega === 'despacho_a_domicilio'} onChange={(e) => setTipoEntrega(e.target.value)} />
                    Despacho a Domicilio
                  </label>
                </div>

                {tipoEntrega === 'entrega_en_sucursal' && (
                  <div className="sub-form">
                    <label>Sucursal de Retiro</label>
                    {cargandoSucursales ? <p>Cargando sucursales...</p> : (
                      <select value={idSucursal} onChange={(e) => setIdSucursal(e.target.value)} required>
                        {sucursales.map(suc => (
                          <option key={suc.id_sucursal} value={suc.id_sucursal}>
                            {suc.calle} {suc.numero}, {suc.comuna}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {tipoEntrega === 'despacho_a_domicilio' && (
                  <div className="sub-form">
                    <label>Comuna</label>
                    <select value={comuna} onChange={(e) => setComuna(e.target.value)} required>
                      <option value="">Selecciona una comuna</option>
                      {comunasChile.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    
                    <label style={{ marginTop: '10px' }}>Calle</label>
                    <input type="text" placeholder="Ej: Av. Los Leones" value={calle} onChange={(e) => setCalle(e.target.value)} required />
                    
                    <label style={{ marginTop: '10px' }}>Número</label>
                    <input type="number" min="1" placeholder="Ej: 1234" value={numero} onChange={(e) => setNumero(e.target.value)} required />
                  </div>
                )}
              </div>

              <div className="form-group-block">
                <h3>Documento Tributario</h3>
                <div className="radio-group">
                  <label>
                    <input type="radio" value="boleta" checked={tipoDoc === 'boleta'} onChange={(e) => setTipoDoc(e.target.value)} />
                    Boleta
                  </label>
                  <label>
                    <input type="radio" value="factura" checked={tipoDoc === 'factura'} onChange={(e) => setTipoDoc(e.target.value)} />
                    Factura
                  </label>
                </div>

                {tipoDoc === 'factura' && (
                  <div className="sub-form">
                    <label>RUT Empresa</label>
                    <input 
                      type="text" 
                      placeholder="Ej: 76.123.456-K" 
                      value={rutEmpresa} 
                      onChange={(e) => setRutEmpresa(formatearRut(e.target.value))} 
                      maxLength={12}
                      required 
                    />
                  </div>
                )}
              </div>

              <div className="form-group-block">
                <h3>Método de Pago</h3>
                <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                  <option value="debito">Tarjeta de Débito (Webpay)</option>
                  <option value="credito">Tarjeta de Crédito (Webpay)</option>
                </select>
              </div>

              {error && <div className="mensaje-error">{error}</div>}

              <button type="submit" className="btn-pagar" disabled={procesando}>
                {procesando ? 'Procesando...' : `Pagar ${formatearMoneda(cartTotal)}`}
              </button>
            </form>
          </div>

          <div className="checkout-summary">
            <h3>Resumen del Pedido</h3>
            <div className="summary-items">
              {cart.map(item => (
                <div key={item.sku} className="summary-item">
                  <span>{item.nombre} x{item.cantidad}</span>
                  <span>{formatearMoneda(item.precio * item.cantidad)}</span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <strong>Total a Pagar</strong>
              <strong>{formatearMoneda(cartTotal)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
