/**
 * Formatea un string de dígitos como precio con puntos de miles (formato chileno).
 * Ej: "1000" -> "1.000", "150000" -> "150.000"
 */
export function formatearPrecio(digitos) {
  if (!digitos) return '';
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}