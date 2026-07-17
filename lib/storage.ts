/**
 * Utilitários de Storage para logos de clubes.
 * Bucket: "logos" (público)
 * Path:   clubs/<clubId>.jpg
 */

import { supabase } from './supabase';

const BUCKET = 'logos';

/**
 * Faz upload (ou substitui) o logo de um clube.
 * O arquivo já deve ter sido comprimido via compressImage().
 * Retorna a URL pública com cache-bust para exibição imediata.
 */
export async function uploadClubLogo(clubId: string, file: File): Promise<string> {
  const path = `clubs/${clubId}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: 'image/jpeg' });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Append versão para invalidar CDN cache na substituição
  return `${data.publicUrl}?v=${Date.now()}`;
}

/**
 * Remove o logo de um clube do storage.
 * Silencia erros (arquivo pode não existir).
 */
export async function deleteClubLogo(clubId: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([`clubs/${clubId}.jpg`]);
}
