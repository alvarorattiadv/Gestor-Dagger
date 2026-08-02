const MAX_DIMENSION = 1800;

export interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

/** Reads an image file, downscales it if needed, and returns a compressed data URL sized to fit as a map background. */
export function loadImageFile(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(objectUrl);
      if (!ctx) {
        reject(new Error('Não foi possível processar a imagem neste navegador.'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.87), width, height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Falha ao carregar a imagem. Verifique se o arquivo é uma imagem válida.'));
    };

    img.src = objectUrl;
  });
}
