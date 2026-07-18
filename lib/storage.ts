/**
 * Utilitários de Storage para logos de clubes.
 * Bucket: "logos" (público)
 * Path:   clubs/<clubId>.<jpg|png>  — png quando o arquivo tem transparência
 *         (ver lib/compress.ts), pra não perder o canal alfa.
 */

import { supabase } from './supabase';

const BUCKET = 'logos';
const EXTENSIONS = ['jpg', 'png'];

function extFor(file: File): 'jpg' | 'png' {
  return file.type === 'image/png' ? 'png' : 'jpg';
}

/**
 * Faz upload (ou substitui) o logo de um clube.
 * O arquivo já deve ter sido comprimido via compressImage().
 * Retorna a URL pública com cache-bust para exibição imediata.
 */
export async function uploadClubLogo(clubId: string, file: File): Promise<string> {
  const ext = extFor(file);
  const path = `clubs/${clubId}.${ext}`;

  // Remove qualquer versão com a outra extensão (ex: troca de jpg comprimido
  // por png transparente) pra não deixar arquivo órfão no bucket.
  const otherExt = EXTENSIONS.find(e => e !== ext);
  if (otherExt) await supabase.storage.from(BUCKET).remove([`clubs/${clubId}.${otherExt}`]);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

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
  await supabase.storage.from(BUCKET).remove(EXTENSIONS.map(e => `clubs/${clubId}.${e}`));
}
