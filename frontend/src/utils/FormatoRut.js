/**
 * Formatea un RUT chileno agregando puntos de miles y el guión antes del
 * dígito verificador, a medida que el usuario escribe.
 * Ej: "12345678k" -> "12.345.678-k"
 */
export function formatearRut(valorCrudo) {
  const limpio = valorCrudo.replace(/[^0-9kK]/g, '').toUpperCase();

  if (limpio.length === 0) return '';
  if (limpio.length === 1) return limpio;

  const cuerpo = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const dv = limpio.slice(-1);

  return `${cuerpo}-${dv}`;
}

/**
 * Devuelve el RUT sin formato (solo dígitos + dv), útil para mandar
 * al backend sin puntos ni guión si tu columna lo espera así.
 * Si tu columna Usuario.RUT SÍ espera el formato con puntos/guión
 * (como VARCHAR(12) sugiere), usá directamente el valor formateado.
 */
export function limpiarRut(rutFormateado) {
  return rutFormateado.replace(/[.-]/g, '');
}