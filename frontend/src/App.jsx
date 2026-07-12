import { Routes, Route, NavLink } from 'react-router-dom';
import Categorias from './components/Categorias';
import ListaProductos from './components/ListaProductos';
import DetalleProducto from './components/DetalleProducto';
import Login from './components/Login';
import RegistrarPersonal from './components/RegistrarPersonal';
import RutaProtegida from './components/RutaProtegida';
import { useAuth } from './useAuth';
import './App.css';

function Inicio() {
  return (
    <div className="pagina-inicio">
      <h1>Bienvenido al Sistema</h1>
      <p>Selecciona una opción en el menú lateral para interactuar con la base de datos.</p>
    </div>
  );
}

function App() {
  const { estaLogueado, rol, logout } = useAuth();

  return (
    <div className="app-layout">
      {/* ================= BARRA LATERAL (MENU) ================= */}
      <nav className="app-sidebar">
        <h2 className="app-sidebar-titulo">Lubrishell Admin</h2>

        <ul className="app-sidebar-lista">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'app-sidebar-link app-sidebar-link-activo' : 'app-sidebar-link'
              }
            >
              🏠 Inicio
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/categorias"
              className={({ isActive }) =>
                isActive ? 'app-sidebar-link app-sidebar-link-activo' : 'app-sidebar-link'
              }
            >
              📁 Ver Categorías
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/productos"
              className={({ isActive }) =>
                isActive ? 'app-sidebar-link app-sidebar-link-activo' : 'app-sidebar-link'
              }
            >
              🛢️ Ver Productos
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
                ➕ Crear Producto
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
                👤 Crear Cuenta Personal
              </NavLink>
            </li>
          )}
        </ul>

        <div className="app-sidebar-sesion">
          {estaLogueado ? (
            <button className="app-sidebar-link" onClick={logout}>
              🚪 Cerrar sesión
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? 'app-sidebar-link app-sidebar-link-activo' : 'app-sidebar-link'
              }
            >
              🔑 Iniciar sesión
            </NavLink>
          )}
        </div>
      </nav>

      {/* ================= ÁREA DE CONTENIDO PRINCIPAL ================= */}
      <main className="app-contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/productos" element={<ListaProductos />} />
          <Route path="/productos/:sku" element={<DetalleProducto />} />

          {/* Ejemplo de ruta protegida solo para ciertos roles */}
          <Route
            path="/productos/crear"
            element={
              <RutaProtegida rolesPermitidos={['administrador', 'jefe_bodega']}>
                <div>Formulario de creación de producto (a implementar)</div>
              </RutaProtegida>
            }
          />

          {/* Solo administrador puede crear cuentas de personal */}
          <Route
            path="/personal/crear"
            element={
              <RutaProtegida rolesPermitidos={['administrador']}>
                <RegistrarPersonal />
              </RutaProtegida>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;