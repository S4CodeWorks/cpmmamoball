// Mapeia as páginas que têm URL real e compartilhável (usadas pro deep link e
// pro card de preview no WhatsApp/redes). As demais páginas do app continuam
// navegação em memória, sem rota própria.

export function pathForPage(page: string, param: string | number | null): string | null {
  const staticPaths: Record<string,string> = { login:'/entrar', saved:'/salvos', notices:'/avisos' };
  if(staticPaths[page])return staticPaths[page];
  if (param == null) return null;
  switch (page) {
    case 'notice': return `/avisos/${encodeURIComponent(String(param))}`;
    case 'match':   return `/partida/${param}`;
    case 'club':    return `/clube/${param}`;
    case 'article': return `/noticia/${param}`;
    default:        return null;
  }
}
