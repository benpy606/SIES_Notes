/**
 * Compresses an image file on the client side using HTML Canvas.
 * Scales the image to a maximum dimension of 1080px (width or height).
 * Converts the image to WebP with 0.75 quality, targeting ~150KB.
 */
export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // If the browser doesn't support FileReader or Canvas, return original file
    if (typeof window === 'undefined' || !window.FileReader || !window.HTMLCanvasElement) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const maxDimension = 1080;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file); // Fallback to original
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file); // Fallback to original
                return;
              }
              const baseName = file.name.includes('.')
                ? file.name.slice(0, file.name.lastIndexOf('.'))
                : file.name;
              const compressedFile = new File([blob], `${baseName || 'image'}_compressed.webp`, {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/webp',
            0.75
          );
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
