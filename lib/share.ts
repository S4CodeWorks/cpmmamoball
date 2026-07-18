/**
 * Compartilhamento real — usa a Web Share API nativa (menu de compartilhar do
 * sistema) quando disponível, com fallback pra copiar o link no clipboard.
 * Passe `url` com o caminho real (ver lib/routes.ts) pra partida/clube/notícia
 * gerarem preview (banner) automático quando colados no WhatsApp etc.
 */

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export async function shareLink(opts: { title: string; text?: string; url?: string }): Promise<ShareResult> {
  const url = opts.url ?? (typeof window !== 'undefined' ? window.location.origin : '');

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: opts.title, text: opts.text, url });
      return 'shared';
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return 'cancelled';
      // Cai pro fallback de clipboard se o compartilhamento nativo falhar por outro motivo
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url);
      return 'copied';
    } catch {
      return 'failed';
    }
  }

  return 'failed';
}
