import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const item = window.localStorage.getItem('lubrishell_cart');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.warn('Error reading localStorage cart', error);
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem('lubrishell_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (producto, cantidad) => {
    setCart((prev) => {
      const existe = prev.find((item) => item.sku === producto.sku);
      if (existe) {
        return prev.map((item) =>
          item.sku === producto.sku
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prev, { ...producto, cantidad }];
    });
  };

  const updateQuantity = (sku, cantidad) => {
    setCart((prev) =>
      prev.map((item) =>
        item.sku === sku ? { ...item, cantidad: Math.max(1, cantidad) } : item
      )
    );
  };

  const removeFromCart = (sku) => {
    setCart((prev) => prev.filter((item) => item.sku !== sku));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (acc, item) => acc + (item.precio || 0) * item.cantidad,
    0
  );

  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
