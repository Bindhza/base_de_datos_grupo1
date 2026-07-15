import { useCallback, useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import { fetchAutenticado } from '../api';
import './Entregas.css';
import './DespacharDomicilio.css';

function DespacharDomicilio() {
  const [entregas, setEntregas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [codigos, setCodigos] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [enviandoId, setEnviandoId] = useState(null);

  // Estados para estadísticas de tardanza
  const [reporteTardanza, setReporteTardanza] = useState([]);
  const [cargandoReporte, setCargandoReporte] = useState(false);
  const [errorReporte, setErrorReporte] = useState(null);

  const cargarEntregas = useCallback(() => {
    setCargando(true);
    setError(null);
    fetchAutenticado('/entregas/despacho-domicilio/preparacion/')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron cargar las entregas');
        return res.json();
      })
      .then((data) => {
        setEntregas(data);
        const iniciales = {};
        data.forEach((e) => {
          iniciales[e.id_entrega] = e.codigo_seguimiento || '';
        });
        setCodigos(iniciales);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const cargarReporte = useCallback(() => {
    setCargandoReporte(true);
    setErrorReporte(null);
    fetchAutenticado('/entregas/reporte-despachos-tardados/')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el reporte de tardanza');
        return res.json();
      })
      .then((data) => setReporteTardanza(data))
      .catch((err) => setErrorReporte(err.message))
      .finally(() => setCargandoReporte(false));
  }, []);

  useEffect(() => {
    cargarEntregas();
    cargarReporte();
  }, [cargarEntregas, cargarReporte]);

  const formatearIntervalo = (intervalo) => {
    if (!intervalo) return '-';
    return intervalo
      .replace('days', 'días')
      .replace('day', 'día')
      .replace('mons', 'meses')
      .replace('mon', 'mes');
  };

  const registrarDespacho = async (idEntrega) => {
    setMensaje(null);
    setEnviandoId(idEntrega);
    const codigo_seguimiento = codigos[idEntrega]?.trim();

    if (!codigo_seguimiento) {
      setMensaje({ tipo: 'error', texto: 'El código de seguimiento es requerido para realizar el despacho' });
      setEnviandoId(null);
      return;
    }

    try {
      const datos = new FormData();
      datos.append('codigo_seguimiento', codigo_seguimiento);

      const res = await fetchAutenticado(`/entregas/${idEntrega}/despachar/`, {
        method: 'POST',
        body: datos,
      });
      const cuerpo = await res.json();

      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: cuerpo.error || 'No se pudo registrar el despacho' });
        return;
      }

      setMensaje({ tipo: 'exito', texto: `Despacho de entrega #${idEntrega} registrado exitosamente` });
      setEntregas((previas) => previas.filter((e) => e.id_entrega !== idEntrega));
      cargarReporte();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setEnviandoId(null);
    }
  };

  if (cargando) return <p className="entregas-estado">Cargando entregas a domicilio...</p>;
  if (error) return <p className="entregas-estado entregas-estado-error">{error}</p>;

  return (
    <div className="entregas-contenedor">
      <div className="entregas-encabezado">
        <h1>
          <Truck size={26} strokeWidth={1.75} /> Despachar a Domicilio
        </h1>
        <p>Entregas a domicilio preparadas y pendientes de despacho. Ingresa el código de seguimiento provisto por el transporte.</p>
      </div>

      {mensaje && (
        <p className={mensaje.tipo === 'exito' ? 'entregas-mensaje-exito' : 'entregas-mensaje-error'}>
          {mensaje.texto}
        </p>
      )}

      <div className="despacho-reporte-seccion" style={{ marginBottom: '40px' }}>
        <h2 className="reporte-titulo" style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '16px', fontWeight: '700' }}>
          Los 10 Despachos que más tardaron desde su preparación
        </h2>
        
        {cargandoReporte && <p className="entregas-estado">Cargando estadísticas...</p>}
        {errorReporte && <p className="entregas-estado entregas-estado-error">{errorReporte}</p>}
        
        {!cargandoReporte && !errorReporte && reporteTardanza.length === 0 && (
          <p className="entregas-estado">No hay registros de despachos despachados para calcular tiempos.</p>
        )}

        {!cargandoReporte && !errorReporte && reporteTardanza.length > 0 && (
          <div className="entregas-tabla-envoltorio">
            <table className="entregas-tabla">
              <thead>
                <tr>
                  <th>Entrega #</th>
                  <th>Orden #</th>
                  <th>Fecha Preparación</th>
                  <th>Fecha Despacho</th>
                  <th style={{ textAlign: 'right' }}>Tiempo de Demora</th>
                </tr>
              </thead>
              <tbody>
                {reporteTardanza.map((r) => (
                  <tr key={r.id_entrega}>
                    <td>{r.id_entrega}</td>
                    <td>{r.id_orden_compra}</td>
                    <td>{r.fecha_preparacion ? new Date(r.fecha_preparacion).toLocaleString('es-CL') : '-'}</td>
                    <td>{r.fecha_despacho ? new Date(r.fecha_despacho).toLocaleString('es-CL') : '-'}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#d94e3f' }}>
                      {formatearIntervalo(r.tiempo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '16px', fontWeight: '700' }}>
        Pendientes de Despacho
      </h2>

      {entregas.length === 0 ? (
        <p className="entregas-estado">No hay entregas a domicilio pendientes de despacho.</p>
      ) : (
        <div className="entregas-tabla-envoltorio">
          <table className="entregas-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Orden</th>
                <th>Dirección de Envío</th>
                <th>Cantidad</th>
                <th>Código Seguimiento</th>
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
                    <input
                      type="text"
                      placeholder="Ej: SEG-CL-12345"
                      className="despacho-seguimiento-input"
                      value={codigos[e.id_entrega] || ''}
                      onChange={(ev) =>
                        setCodigos({ ...codigos, [e.id_entrega]: ev.target.value })
                      }
                      disabled={enviandoId === e.id_entrega}
                    />
                  </td>
                  <td>
                    <button
                      className="entregas-boton"
                      disabled={enviandoId === e.id_entrega || !codigos[e.id_entrega]?.trim()}
                      onClick={() => registrarDespacho(e.id_entrega)}
                    >
                      {enviandoId === e.id_entrega ? 'Registrando...' : 'Registrar despacho'}
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

export default DespacharDomicilio;