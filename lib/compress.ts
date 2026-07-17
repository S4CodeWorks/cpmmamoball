/**
 * Comprime uma imagem no lado do cliente usando a Canvas API.
 * Redimensiona para no máximo MAX_DIM px em qualquer dimensão,
 * depois reduz qualidade JPEG iterativamente até ≤ MAX_BYTES.
 * Sempre retorna um File JPEG.
 */

const MAX_BYTES = 500_000; // 500 KB
const MAX_DIM   = 800;     // px máx em qualquer dimensão

export async function compressImage(file: File): Promise<File> {
  // Desenha no canvas
  const bitmap = await createImageBitmap(file);
  let { width: w, height: h } = bitmap;

  // Escala para caber em MAX_DIM × MAX_DIM
  if (w > MAX_DIM || h > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width  = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // Tenta qualidades decrescentes: 0.92 → 0.84 → ... → 0.20
  for (let q = 0.92; q >= 0.20; q -= 0.08) {
    const blob = await toBlob(canvas, q);
    if (blob.size <= MAX_BYTES) {
      return blobToFile(blob, file.name);
    }
  }

  // Último recurso: qualidade mínima
  const blob = await toBlob(canvas, 0.10);
  return blobToFile(blob, file.name);
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('canvas.toBlob falhou'))),
      'image/jpeg',
      quality,
    ),
  );
}

function blobToFile(blob: Blob, originalName: string): File {
  const name = originalName.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg' });
}
