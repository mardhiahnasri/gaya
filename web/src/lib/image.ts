export interface PickedImage {
  dataUrl: string;
  base64: string;
  mimeType: string;
}

/**
 * Reads an image file and downsizes it so uploads stay small and local models stay fast.
 */
export async function readImage(file: File, maxSize = 1024, quality = 0.85): Promise<PickedImage> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not read that image.'));
      el.src = url;
    });

    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not supported in this browser.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    return { dataUrl, base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' };
  } finally {
    URL.revokeObjectURL(url);
  }
}
