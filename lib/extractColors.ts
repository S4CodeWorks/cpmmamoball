// Extrai as duas cores dominantes de uma imagem (escudo do clube) via Canvas API,
// pra alimentar os gradientes/blur do site com a cor real do clube em vez de um
// placeholder genérico.

function toHex(r: number, g: number, b: number): string {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

// Distância perceptual simples entre duas cores RGB
function colorDist(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

export async function extractCrestColors(file: File): Promise<[string, string]> {
  const bitmap = await createImageBitmap(file);
  const size = 48; // amostragem pequena é suficiente e rápida
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, size, size);
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, size, size);

  // Agrupa pixels em baldes (buckets) de cor, ignorando transparentes e
  // tons quase brancos/pretos/cinzas (geralmente fundo, não a cor do time)
  const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    const sat = max === min ? 0 : (max - min) / (255 - Math.abs(2 * lightness - 255));
    if (lightness > 240 || lightness < 15) continue; // quase branco/preto
    if (sat < 0.12) continue; // quase cinza

    const key = `${r >> 4}-${g >> 4}-${b >> 4}`; // bucket de 16 níveis por canal
    const bucket = buckets.get(key);
    if (bucket) { bucket.count++; bucket.r += r; bucket.g += g; bucket.b += b; }
    else buckets.set(key, { count: 1, r, g, b });
  }

  const sorted = [...buckets.values()]
    .map(b => ({ count: b.count, r: Math.round(b.r / b.count), g: Math.round(b.g / b.count), b: Math.round(b.b / b.count) }))
    .sort((x, y) => y.count - x.count);

  if (sorted.length === 0) return ['#3b82f6', '#ffffff'];

  const primary = sorted[0];
  const primaryRgb: [number, number, number] = [primary.r, primary.g, primary.b];

  // Segunda cor: o próximo bucket mais popular que seja perceptualmente distinto do primeiro
  const secondary = sorted.find(c => colorDist([c.r, c.g, c.b], primaryRgb) > 60) ?? null;

  return [
    toHex(primary.r, primary.g, primary.b),
    secondary ? toHex(secondary.r, secondary.g, secondary.b) : '#ffffff',
  ];
}
