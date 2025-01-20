# Clent side lossy image compression

This project aims to provide a plug and play utils.ts file for client side image compression with hight speed (~0.5 seconds for file size ~5Mb) and relatively readable quality.

## A bit of literature review
The major client side compression solution involves [UPNG.js](https://github.com/photopea/UPNG.js) and/or [ngx-image-compress](https://www.npmjs.com/package/ngx-image-compress). However, UPNG.js requires the input image to be of RGBA format, otherwise manual conversion to RGBA format is required, resulting in a slower overall compression speed. ngx-image-compress, on the other hand, is quite fast and convienient, as it handles the file upload part automatically. However, it only supports jpeg format. Trying with .png format will result in a even larger file. Hence, in some scenario where color retaintion/image quality is not a serious concern (as long as the image is readable), a native typescript solution to a speedy client side image compression may be preferred. 

## Core method in utils.ts
The project does not rely on any third party library, it uses the `HTMLCanvasElement.toBlob()` method as the engine for compression. Just directly invoke the below method in your application. 
```
/**
 * @param {Object}  file source file
 * @param {Nubmber} quality quality ranging from 0 to 1
 * @returns a compressed new file in jpeg format
 */
export const compressionFile = async(file: File, quality = 0.5) => {...};
```
Since the [documentation](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) of `HTMLCanvasElement.toBlob()` does not specify how `quality` will impact the actual compression result. I strongly recommend you to try out different values of `quality` to find out the optimal value for your compression. For my case, I found out `quality = 0.5` is the optimal compression ratio by considering both speed and quality. 

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. A mini web app will demonstrate the compression process.

## How to use
just paste the utils.ts file into your project code and invoke the `compressionFile` method

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Example
before compression: ![2](https://github.com/user-attachments/assets/1d977bb1-7b76-4dcb-b04d-16f29186b39a)
after compression: ![jpegRes1](https://github.com/user-attachments/assets/c30dc9da-1858-4dd8-8758-8bc1ed4940de)


