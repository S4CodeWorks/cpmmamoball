// Mapeia as páginas que têm URL real e compartilhável (usadas pro deep link e
// pro card de preview no WhatsApp/redes). As demais páginas do app continuam
// navegação em memória, sem rota própria.

export function pathForPage(page: string, param: string | number | null): string | null {
  if (param == null) return null;
  switch (page) {
    case 'match':   return `/partida/${param}`;
    case 'club':    return `/clube/${param}`;
    case 'article': return `/noticia/${param}`;
    default:        return null;
  }
}
