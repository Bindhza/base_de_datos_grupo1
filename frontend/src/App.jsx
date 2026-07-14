import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { LogOut, LogIn, Droplet, Home, FolderOpen, Package, PlusSquare, UserPlus, Tag } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Categorias from './components/Categorias';
import ListaProductos from './components/ListaProductos';
import DetalleProducto from './components/DetalleProducto';
import Login from './components/Login';
import RegistrarCliente from './components/RegistrarCliente';
import RegistrarPersonal from './components/RegistrarPersonal';
import RegistrarProducto from './components/RegistrarProducto';
import InventarioInmovilizado from './components/InventarioInmovilizado';
import RegistrarMarca from './components/RegistrarMarca';
import PrepararEntregas from './components/PrepararEntregas';
import EntregasRetiro from './components/EntregasRetiro';
import RutaProtegida from './components/RutaProtegida';
import LanzarDescuento from './components/LanzarDescuento';
import { useAuth } from './useAuth';
import './App.css';

const ETIQUETAS_ROL = {
  administrador: 'Administrador',
  jefe_bodega: 'Jefe de Bodega',
  vendedor: 'Vendedor',
};

function obtenerIniciales(nombre, apellido) {
  const inicialNombre = nombre ? nombre.trim().charAt(0).toUpperCase() : '';
  const inicialApellido = apellido ? apellido.trim().charAt(0).toUpperCase() : '';
  return `${inicialNombre}${inicialApellido}` || '?';
}

function App() {
  const { estaLogueado, rol, nombre, apellido, logout } = useAuth();

  return (
    <div className="app-layout">
      {/* ================= BARRA LATERAL ================= */}
      <nav className="app-sidebar">
        <Link to="/" className="app-marca">
          <Droplet size={22} strokeWidth={2} />
          <span>Lubrishell</span>
        </Link>
        <div className="app-sidebar-cuenta">
          {estaLogueado ? (
            <div className="cuenta-tarjeta">
              <div className="cuenta-avatar">{obtenerIniciales(nombre, apellido)}</div>
              <div className="cuenta-info">
                <span className="cuenta-nombre">{nombre} {apellido}</span>
                {rol !== 'cliente' && (
                  <span className="cuenta-rol">{ETIQUETAS_ROL[rol] || rol}</span>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login" className="cuenta-tarjeta cuenta-tarjeta-login">
              <div className="cuenta-avatar cuenta-avatar-vacio">
                <LogIn size={18} strokeWidth={2} />
              </div>
              <div className="cuenta-info">
                <span className="cuenta-nombre">Iniciar sesión</span>
                <span className="cuenta-rol">Accede a tu cuenta</span>
              </div>
            </Link>
          )}
        </div>
 
        <ul className="app-sidebar-lista">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'app-sidebar-link app-sidebar-link-activo' : 'app-sidebar-link'
              }
            >
              <Home size={18} /> Inicio
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/categorias"
              className={({ isActive }) =>
                isActive ? 'app-sidebar-link app-sidebar-link-activo' : 'app-sidebar-link'
              }
            >
              <FolderOpen size={18} /> Ver Categorías
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/productos"
              className={({ isActive }) =>
                isActive ? 'app-sidebar-link app-sidebar-link-activo' : 'app-sidebar-link'
              }
            >
              <Package size={18} /> Ver Productos
            </NavLink>
          </li>
 
          {/* Ejemplo de link visible solo para admin/jefe_bodega */}
          {(rol === 'administrador' || rol === 'jefe_bodega') && (
            <li>
              <NavLink
                to="/productos/crear"
                className={({ isActive }) =>
                  isActive ? 'app-sidebar-link app-sidebar-link-activo' : 'app-sidebar-link'
                }
              >
                <PlusSquare size={18} /> Crear Producto
              </NavLink>
            </li>
          )}
 
          {/* Solo administrador puede crear cuentas de personal */}
          {rol === 'administrador' && (
            <li>
              <NavLink
                to="/personal/crear"
                className={({ isActive }) =>
                  isActive ? 'app-sidebar-link app-sidebar-link-activo' : 'app-sidebar-link'
                }
              >
                <UserPlus size={18} /> Crear Cuenta Personal
              </NavLink>
            </li>
          )}

        </ul>

        {estaLogueado && (
          <button className="app-sidebar-logout" onClick={logout}>
            <LogOut size={17} strokeWidth={2} />
            Cerrar sesión
          </button>
        )}
      </nav>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <main className="app-contenido">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<RegistrarCliente />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/productos" element={<ListaProductos />} />
          <Route path="/productos/:sku" element={<DetalleProducto />} />

          <Route
            path="/productos/crear"
            element={
              <RutaProtegida rolesPermitidos={['administrador', 'jefe_bodega']}>
                <RegistrarProducto />
              </RutaProtegida>
            }
          />

          <Route
            path="/descuento"
            element={
              <RutaProtegida rolesPermitidos={['administrador', 'jefe_bodega']}>
                <LanzarDescuento />
              </RutaProtegida>
            }
          />

          <Route
            path="/productos/marcas/registrar"
            element={
              <RutaProtegida rolesPermitidos={['administrador', 'jefe_bodega']}>
                <RegistrarMarca />
              </RutaProtegida>
            }
          />

          <Route
            path="/personal/crear"
            element={
              <RutaProtegida rolesPermitidos={['administrador']}>
                <RegistrarPersonal />
              </RutaProtegida>
            }
          />

          <Route
            path="/productos/inmovilizado/"
            element={
              <RutaProtegida rolesPermitidos={['administrador', 'jefe_bodega']}>
                <InventarioInmovilizado />
              </RutaProtegida>
              }
          />
          <Route
            path="/entregas/preparar"
            element={
              <RutaProtegida rolesPermitidos={['administrador', 'jefe_bodega']}>
                <PrepararEntregas />
              </RutaProtegida>
            }
          />

          {/* entregar en sucursal */}
          <Route
            path="/entregas/retiro"
            element={
              <RutaProtegida rolesPermitidos={['administrador', 'vendedor']}>
                <EntregasRetiro />
              </RutaProtegida>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;