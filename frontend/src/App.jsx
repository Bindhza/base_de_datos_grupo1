import { Routes, Route, NavLink } from 'react-router-dom';
import Categorias from './components/Categorias';
import ListaProductos from './components/ListaProductos';
import DetalleProducto from './components/DetalleProducto';
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
          {/* Agregá más links acá a medida que sumes RFs */}
        </ul>
      </nav>

      {/* ================= ÁREA DE CONTENIDO PRINCIPAL ================= */}
      <main className="app-contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/productos" element={<ListaProductos />} />
          <Route path="/productos/:sku" element={<DetalleProducto />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;