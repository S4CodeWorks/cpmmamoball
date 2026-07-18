/**
 * Comprime uma imagem no lado do cliente usando a Canvas API.
 * Redimensiona para no máximo MAX_DIM px em qualquer dimensão.
 * Se a imagem tiver transparência (canal alfa), preserva como PNG — nunca
 * achata pra JPEG, que não tem alfa e enche o fundo transparente de preto.
 * Sem transparência, comprime como JPEG reduzindo qualidade até ≤ MAX_BYTES.
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

  if (hasTransparency(ctx, w, h)) {
    const blob = await toBlob(canvas, 'image/png');
    return blobToFile(blob, file.name, 'png', 'image/png');
  }

  // Tenta qualidades decrescentes: 0.92 → 0.84 → ... → 0.20
  for (let q = 0.92; q >= 0.20; q -= 0.08) {
    const blob = await toBlob(canvas, 'image/jpeg', q);
    if (blob.size <= MAX_BYTES) {
      return blobToFile(blob, file.name, 'jpg', 'image/jpeg');
    }
  }

  // Último recurso: qualidade mínima
  const blob = await toBlob(canvas, 'image/jpeg', 0.10);
  return blobToFile(blob, file.name, 'jpg', 'image/jpeg');
}

function hasTransparency(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  const { data } = ctx.getImageData(0, 0, w, h);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('canvas.toBlob falhou'))),
      type,
      quality,
    ),
  );
}

function blobToFile(blob: Blob, originalName: string, ext: string, mime: string): File {
  const name = originalName.replace(/\.[^.]+$/, '') + '.' + ext;
  return new File([blob], name, { type: mime });
}
