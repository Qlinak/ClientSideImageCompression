import heic2any from 'heic2any';

const fileToDataURL = (file: Blob): Promise<any> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = (e) => resolve((e.target as FileReader).result)
    reader.readAsDataURL(file)
  });
}

const dataURLToImage = (dataURL: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = dataURL
  });
}

// lossy compression to ensure speed
const canvastoFile = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> => {
  return new Promise((resolve) => canvas.toBlob(
    (blob) => resolve(blob),
    type,
    quality)
  );
}

/**
 * @param {Object}  file source file
 * @param {String} type output type
 * @param {Nubmber} quality quality ranging from 0 to 1
 * @returns a compressed new file
 */
export const compressionFile = async(file: File, type = 'image/jpeg', quality = 0.5) => {
  if(type == 'image/heif'){
    return convertHeicToImage(file, quality);
  }

  const fileName = file.name
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  const base64 = await fileToDataURL(file)
  const img = await dataURLToImage(base64)
  canvas.width = img.width
  canvas.height = img.height
  context.clearRect(0, 0, img.width, img.height)
  context.drawImage(img, 0, 0, img.width, img.height)
  const blob = (await canvastoFile(canvas, type, quality)) as Blob
  return new File([blob], fileName, {
    type: type
  });
}

const convertHeicToImage = async (
  file: Blob,
  quality: number = 0.5
): Promise<File> => {
  try {
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: quality, // Compress the image quality
    });

    return new File([converted as Blob], 'res', {
      type: 'image/jpeg',
    });
  } catch (error) {
    console.error('HEIF Conversion Failed:', error);
    throw error;
  }
};
