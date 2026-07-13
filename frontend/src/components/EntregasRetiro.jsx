import { useCallback, useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import { fetchAutenticado } from '../api';
import './Entregas.css';

function EntregasRetiro() {
  const [entregas, setEntregas] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [enviandoId, setEnviandoId] = useState(null);

  const cargarEntregas = useCallback(() => {
    setCargando(true);
    setError(null);
    fetchAutenticado('/entregas/retiro/')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron cargar las entregas');
        return res.json();
      })
      .then((data) => setEntregas(data))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));

    // desempeño de vendedores
    fetchAutenticado('/entregas/desempeno/')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRanking(data))
      .catch(() => setRanking([]));
  }, []);

  useEffect(() => {
    cargarEntregas();
  }, [cargarEntregas]);

  const registrarEntrega = async (idEntrega) => {
    setMensaje(null);
    setEnviandoId(idEntrega);
    try {
      const res = await fetchAutenticado(`/entregas/${idEntrega}/entregar/`, {
        method: 'POST',
      });
      const cuerpo = await res.json();

      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: cuerpo.error || 'No se pudo registrar la entrega' });
        return;
      }

      setMensaje({ tipo: 'exito', texto: `Entrega #${idEntrega} registrada como entregada al cliente` });
      setEntregas((previas) => previas.filter((e) => e.id_entrega !== idEntrega));
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setEnviandoId(null);
    }
  };

  if (cargando) return <p className="entregas-estado">Cargando entregas...</p>;
  if (error) return <p className="entregas-estado entregas-estado-error">{error}</p>;

  return (
    <div className="entregas-contenedor">
      <div className="entregas-encabezado">
        <h1>
          <Store size={26} strokeWidth={1.75} /> Entregas en sucursal
        </h1>
        <p>Paquetes disponibles para retiro. Registra la entrega cuando el cliente retire su pedido.</p>
      </div>

      {mensaje && (
        <p className={mensaje.tipo === 'exito' ? 'entregas-mensaje-exito' : 'entregas-mensaje-error'}>
          {mensaje.texto}
        </p>
      )}

      {entregas.length === 0 ? (
        <p className="entregas-estado">No hay entregas disponibles para retiro.</p>
      ) : (
        <div className="entregas-tabla-envoltorio">
          <table className="entregas-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Orden</th>
                <th>Sucursal</th>
                <th>Cantidad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entregas.map((e) => (
                <tr key={e.id_entrega}>
                  <td>{e.id_entrega}</td>
                  <td>
                    {e.producto}
                    <span className="entregas-sku">SKU {e.sku_producto}</span>
                  </td>
                  <td>{e.id_orden_compra}</td>
                  <td>
                    {e.comuna}
                    <span className="entregas-sku">{e.calle} {e.numero}</span>
                  </td>
                  <td>{e.cantidad}</td>
                  <td>
                    <button
                      className="entregas-boton"
                      disabled={enviandoId === e.id_entrega}
                      onClick={() => registrarEntrega(e.id_entrega)}
                    >
                      {enviandoId === e.id_entrega ? 'Registrando...' : 'Registrar entrega'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ranking.length > 0 && (
        <div className="entregas-ranking">
          <h2>Desempeño de vendedores</h2>
          <p className="entregas-ranking-sub">Entregas en sucursal completadas por cada vendedor</p>
          <div className="entregas-tabla-envoltorio">
            <table className="entregas-tabla">
              <thead>
                <tr>
                  <th>Vendedor</th>
                  <th>RUT</th>
                  <th>Entregas completadas</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((v) => (
                  <tr key={v.rut_vendedor}>
                    <td>{v.nombre} {v.apellido}</td>
                    <td>{v.rut_vendedor}</td>
                    <td>{v.entregas_completadas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default EntregasRetiro;
