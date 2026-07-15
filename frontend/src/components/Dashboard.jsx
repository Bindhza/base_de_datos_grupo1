import { Link } from 'react-router-dom';
import {
  Package,
  LayoutGrid,
  CircleDollarSign,
  PackagePlus,
  Award,
  UserPlus,
  Store,
  TrendingUp,
  Activity,
  PackageCheck,
  Truck,
  Tag,
} from 'lucide-react';
import { useAuth } from '../useAuth';
import './Dashboard.css';

function Dashboard() {
  const { estaLogueado, rol } = useAuth();

  const puedeGestionarProductos = rol === 'administrador' || rol === 'jefe_bodega';
  const esAdministrador = rol === 'administrador';
  const puedeEntregar = rol === 'administrador' || rol === 'vendedor';

  const tarjetas = [
    {
      to: '/productos',
      icono: Package,
      titulo: 'Ver productos',
      descripcion: 'Explora el catálogo completo de productos',
    },
    {
      to: '/productos/reporte-descuentos',
      icono: Tag,
      titulo: 'Reporte de Grandes Ofertas',
      descripcion: 'Consulta los productos con descuentos iguales o mayores al 30% y su ahorro total',
    },
  ];

  if (puedeGestionarProductos) {
    tarjetas.push(
      {
        to: '/productos/crear',
        icono: PackagePlus,
        titulo: 'Registrar producto',
        descripcion: 'Carga un nuevo producto al catálogo',
      },
      {
        to: '/productos/marcas/registrar',
        icono: Award,
        titulo: 'Registrar marca',
        descripcion: 'Agrega una marca nueva para tus productos',
      },
      {
        to: '/productos/inmovilizado',
        icono: CircleDollarSign,
        titulo: 'Productos inmbolizados',
        descripcion: 'Ve los productos que no se están vendiendo y cuánto dinero está estancado',
      },
      {
        to: '/productos/mas-comprados',
        icono: TrendingUp,
        titulo: 'Productos más comprados',
        descripcion: 'Conoce los productos más abastecidos a la empresa por los proveedores',
      },
      {
        to: '/productos/variacion-precios',
        icono: Activity,
        titulo: 'Variación de Precios',
        descripcion: 'Analiza el historial y fluctuación de los precios de venta',
      },

      {
        to: '/entregas/preparar',
        icono: PackageCheck,
        titulo: 'Preparar entregas',
        descripcion: 'Arma los paquetes pendientes para retiro en sucursal',
      },
      {
        to: '/entregas/despachar',
        icono: Truck,
        titulo: 'Despachar a domicilio',
        descripcion: 'Registra los despachos y códigos de seguimiento para domicilio',
      }
    );
  }

  if (puedeEntregar) {
    tarjetas.push({
      to: '/entregas/retiro',
      icono: Store,
      titulo: 'Entregas en sucursal',
      descripcion: 'Registra los pedidos retirados por los clientes',
    });
  }

  if (esAdministrador) {
    tarjetas.push({
      to: '/personal/crear',
      icono: UserPlus,
      titulo: 'Crear cuenta de personal',
      descripcion: 'Registra vendedores, jefes de bodega o administradores',
    });
  }

  return (
    <div className="dashboard-contenedor">
      <div className="dashboard-encabezado">
        <h1>Panel de control</h1>
        <p>Elije una sección para continuar</p>
      </div>

      <div className="dashboard-grid">
        {tarjetas.map(({ to, icono: Icono, titulo, descripcion }) => (
          <Link key={to} to={to} className="dashboard-tarjeta">
            <div className="dashboard-tarjeta-icono">
              <Icono size={26} strokeWidth={1.75} />
            </div>
            <h2>{titulo}</h2>
            <p>{descripcion}</p>
          </Link>
        ))}
      </div>

      {!estaLogueado && (
        <p className="dashboard-nota">
          Inicia sesión para acceder a más opciones según tu rol.
        </p>
      )}
    </div>
  );
}

export default Dashboard;