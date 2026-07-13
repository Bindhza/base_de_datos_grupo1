import { useCallback, useEffect, useState } from 'react';
import { PackageCheck } from 'lucide-react';
import { fetchAutenticado } from '../api';
import './Entregas.css';

function PrepararEntregas() {
  const [entregas, setEntregas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cantidades, setCantidades] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [enviandoId, setEnviandoId] = useState(null);

  const cargarEntregas = useCallback(() => {
    setCargando(true);
    setError(null);
    fetchAutenticado('/entregas/preparacion/')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron cargar las entregas');
        return res.json();
      })
      .then((data) => {
        setEntregas(data);
        // Por defecto proponemos la cantidad ya asociada a la entrega
        const iniciales = {};
        data.forEach((e) => {
          iniciales[e.id_entrega] = e.cantidad ?? '';
        });
        setCantidades(iniciales);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargarEntregas();
  }, [cargarEntregas]);

  const prepararEntrega = async (idEntrega) => {
    setMensaje(null);
    setEnviandoId(idEntrega);
    try {
      const datos = new FormData();
      datos.append('cantidad', cantidades[idEntrega]);

      const res = await fetchAutenticado(`/entregas/${idEntrega}/preparar/`, {
        method: 'POST',
        body: datos,
      });
      const cuerpo = await res.json();

      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: cuerpo.error || 'No se pudo preparar la entrega' });
        return;
      }

      setMensaje({
        tipo: 'exito',
        texto: `Entrega #${idEntrega} lista: disponible para retiro`,
      });
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
          <PackageCheck size={26} strokeWidth={1.75} /> Preparar entregas
        </h1>
        <p>Entregas en sucursal pendientes de armar. Indica la cantidad y márcalas como disponibles para retiro.</p>
      </div>

      {mensaje && (
        <p className={mensaje.tipo === 'exito' ? 'entregas-mensaje-exito' : 'entregas-mensaje-error'}>
          {mensaje.texto}
        </p>
      )}

      {entregas.length === 0 ? (
        <p className="entregas-estado">No hay entregas en preparación. 🎉</p>
      ) : (
        <div className="entregas-tabla-envoltorio">
          <table className="entregas-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Orden</th>
                <th>Sucursal</th>
                <th>Solicitado</th>
                <th>Cantidad a preparar</th>
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
                  <td>{e.cantidad_solicitada ?? '—'}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      className="entregas-input"
                      value={cantidades[e.id_entrega] ?? ''}
                      onChange={(ev) =>
                        setCantidades({ ...cantidades, [e.id_entrega]: ev.target.value })
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="entregas-boton"
                      disabled={enviandoId === e.id_entrega}
                      onClick={() => prepararEntrega(e.id_entrega)}
                    >
                      {enviandoId === e.id_entrega ? 'Guardando...' : 'Marcar disponible'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PrepararEntregas;
