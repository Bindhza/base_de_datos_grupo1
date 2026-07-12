import { Navigate } from 'react-router-dom';
import { useAuth } from '../useAuth';

/**
 * Envolvé cualquier <Route> con esto para exigir login.
 * Pasá rolesPermitidos si además querés restringir por rol.
 *
 * Uso:
 *   <Route path="/admin" element={
 *     <RutaProtegida rolesPermitidos={['administrador']}>
 *       <PanelAdmin />
 *     </RutaProtegida>
 *   } />
 */
function RutaProtegida({ children, rolesPermitidos }) {
  const { estaLogueado, rol } = useAuth();

  if (!estaLogueado) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RutaProtegida;