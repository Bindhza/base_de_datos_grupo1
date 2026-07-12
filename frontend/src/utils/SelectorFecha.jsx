import { useEffect, useState } from 'react';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = Array.from({ length: ANIO_ACTUAL - 1920 + 1 }, (_, i) => ANIO_ACTUAL - i);

function diasEnMes(mes, anio) {
  if (!mes) return 31;
  return new Date(anio || ANIO_ACTUAL, mes, 0).getDate();
}

/**
 * Selector de fecha con 3 <select> (día / mes / año).
 * Llama a onChange('YYYY-MM-DD') solo cuando los tres campos están completos.
 * Mientras falte alguno, llama a onChange(null).
 */
function SelectorFecha({ onChange }) {
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');

  const maxDias = diasEnMes(Number(mes), Number(anio));
  const dias = Array.from({ length: maxDias }, (_, i) => i + 1);

  // Si el día guardado ya no existe en el mes/año elegido (ej: 31 de febrero),
  // lo tratamos como "sin seleccionar" sin necesidad de resetear el estado.
  const diaValido = dia && Number(dia) <= maxDias ? dia : '';

  useEffect(() => {
    if (diaValido && mes && anio) {
      const diaStr = String(diaValido).padStart(2, '0');
      const mesStr = String(mes).padStart(2, '0');
      onChange(`${anio}-${mesStr}-${diaStr}`);
    } else {
      onChange(null);
    }
  }, [diaValido, mes, anio, onChange]);

  return (
    <div className="selector-fecha">
      <select
        value={diaValido}
        onChange={(e) => setDia(e.target.value)}
        aria-label="Día"
        required
      >
        <option value="">Día</option>
        {dias.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        value={mes}
        onChange={(e) => setMes(e.target.value)}
        aria-label="Mes"
        required
      >
        <option value="">Mes</option>
        {MESES.map((nombreMes, indice) => (
          <option key={nombreMes} value={indice + 1}>{nombreMes}</option>
        ))}
      </select>

      <select
        value={anio}
        onChange={(e) => setAnio(e.target.value)}
        aria-label="Año"
        required
      >
        <option value="">Año</option>
        {ANIOS.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
    </div>
  );
}

export default SelectorFecha;