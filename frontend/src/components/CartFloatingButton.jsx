import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './CartFloatingButton.css';

function CartFloatingButton() {
  const { cart, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart();
  const [abierto, setAbierto] = useState(false);

  const toggleModal = () => setAbierto(!abierto);

  const formatearMoneda = (valor) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor || 0);

  return (
    <>
      <button className="cart-floating-btn" onClick={toggleModal}>
        <ShoppingCart size={24} color="#fff" />
        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
      </button>

      {abierto && (
        <div className="cart-modal-overlay" onClick={toggleModal}>
          <div className="cart-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-header">
              <h2>Tu Carrito</h2>
              <button className="close-btn" onClick={toggleModal}>
                <X size={24} />
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <p className="cart-vacio">El carrito está vacío</p>
              ) : (
                cart.map((item) => (
                  <div key={item.sku} className="cart-item">
                    <div className="cart-item-info">
                      <p className="cart-item-name">{item.nombre}</p>
                      <p className="cart-item-price">{formatearMoneda(item.precio)} c/u</p>
                    </div>
                    <div className="cart-item-actions">
                      <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.cantidad}
                        onChange={(e) => updateQuantity(item.sku, Number(e.target.value))}
                      />
                      <button onClick={() => removeFromCart(item.sku)} className="remove-btn">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span>{formatearMoneda(cartTotal)}</span>
                </div>
                <Link to="/checkout" onClick={toggleModal} className="checkout-btn">
                  Proceder al Pago
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default CartFloatingButton;
