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
const canvasToFile = (canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> => {
  return new Promise((resolve) => canvas.toBlob(
    (blob) => resolve(blob),
    'image/jpeg',
    quality)
  );
}

/**
 * @param {Object}  file source file
 * @param {Nubmber} quality quality ranging from 0 to 1
 * @returns a compressed new file
 */
export const compressionFile = async(file: File, quality = 0.5) => {
  const fileName = file.name
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  const base64 = await fileToDataURL(file)
  const img = await dataURLToImage(base64)
  canvas.width = img.width
  canvas.height = img.height
  context.clearRect(0, 0, img.width, img.height)
  context.drawImage(img, 0, 0, img.width, img.height)
  const blob = (await canvasToFile(canvas, quality)) as Blob
  return new File([blob], fileName, {
    type: 'image/jpeg'
  });
}
