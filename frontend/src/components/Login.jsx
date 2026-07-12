import { useState } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { useAuth } from '../useAuth';
import { formatearRut } from '../utils/formatoRut';
import './Login.css';
function Login() {
  const [rut, setRut] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
 
  const { login } = useAuth();
  const navigate = useNavigate();
 
  function manejarCambioRut(evento) {
    setRut(formatearRut(evento.target.value));
  }
 
  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError(null);
    setCargando(true);
 
    try {
      await login(rut, contrasena);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }
 
  return (
    <div className="login-contenedor">
      <form className="login-form" onSubmit={manejarSubmit}>
        <h1>Iniciar sesión</h1>
 
        <label className="login-label">
          RUT
          <input
            type="text"
            value={rut}
            onChange={manejarCambioRut}
            placeholder="12.345.678-9"
            maxLength={12}
            required
          />
        </label>
 
        <label className="login-label">
          Contraseña
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </label>
 
        {error && <p className="login-error">{error}</p>}
 
        <button type="submit" className="login-boton" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
 
        <p className="login-registro">
          ¿No tienes cuenta? <Link to="/registro">Registrate acá</Link>
        </p>
      </form>
    </div>
  );
}
 
export default Login;