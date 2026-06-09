/**
 * Elimina todas las referencias académicas del PDF (ej. [cite: 69]) del texto visible.
 * Debe usarse en cualquier componente que renderice contenido proveniente de los JSON de contenido.
 */
export function cleanCitations(text: string): string {
  return text
    .replace(/\[cite:\s*\d+\]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
