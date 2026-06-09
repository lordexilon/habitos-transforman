/**
 * Elimina todas las referencias académicas del PDF (ej. [cite: 69]) del texto visible.
 * Debe usarse en cualquier componente que renderice contenido proveniente de los JSON de contenido.
 */
export function cleanCitations(text: string): string {
  return text
    .replace(/\[cite:\s*\d+(?:\s*,\s*\d+)*\]/gi, '') // Limpia citas simples y múltiples (ej: [cite: 84, 85])
    .replace(/\s+([,.:;?!])/g, '$1')                 // Elimina espacios antes de signos de puntuación
    .replace(/\(\s+/g, '(')                          // Elimina espacio después de abrir paréntesis
    .replace(/\s+\)/g, ')')                          // Elimina espacio antes de cerrar paréntesis
    .replace(/\s{2,}/g, ' ')                         // Normaliza espacios múltiples
    .trim();
}
