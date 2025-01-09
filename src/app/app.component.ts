import {Component} from '@angular/core';
import {NgxImageCompressService} from 'ngx-image-compress';
import * as UPNG from 'upng-js';
import heic2any from 'heic2any';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  constructor(private imageCompress: NgxImageCompressService) {}

  imgResultBeforeCompression: string = '';
  imgResultAfterCompression: string = '';
  sizeBeforeCompression: number = 0;
  sizeAfterCompression: number = 0;
  compressionRatio: number = 0;
  compressionTime: number = 0;
  imageType: string = '';
  quality: number = 50;
  ratio: number = 100;
  fileBuffer: ArrayBuffer | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.sizeBeforeCompression = file.size / 1024 / 1024;
      const reader = new FileReader();
      reader.onload = async () => {
        if (reader.result) {
          try {
            // set image before compression
            if(file.type !== 'image/heif'){
              this.imgResultBeforeCompression = reader.result as string;
            }
            else{
              this.imgResultBeforeCompression = 'dummy';
            }

            if(file.type === 'image/heif'){
              await this.compressHeif(file);
            }
            else if(file.type === 'image/png'){
              this.compressPng(reader.result as string);
            }
            else if(file.type === 'image/jpeg'){
              this.compressJpeg(reader.result as string);
            }
            else{
              alert('unsupported compression source format!')
            }

          } catch (error) {
            console.error('Conversion failed:', error);
          }
        }
      };
      reader.readAsDataURL(file);
      // reader.readAsArrayBuffer(file);
    }
  }

  private async compressHeif(file: File) {
    const startTime = Date.now();
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: this.quality / 100,
    });
    console.log('done');
    const endTime = Date.now();
    this.compressionTime = (endTime - startTime) / 1000;

    if (converted instanceof Blob) {
      const resultReader = new FileReader();
      resultReader.onload = () => {
        this.imgResultAfterCompression = resultReader.result as string;
        this.sizeAfterCompression = this.imageCompress.byteCount(this.imgResultAfterCompression) / 1024 / 1024;
        this.compressionRatio = this.sizeAfterCompression / this.sizeBeforeCompression;
      };

      resultReader.readAsDataURL(converted);
    }
  }

  private compressPng(base64Url: string) {
    this.imageType = 'png';
    this.imgResultBeforeCompression = base64Url;
    const base64Str = base64Url.substring(base64Url.indexOf('base64') + 7); // correct

    this.getImageDimensions(base64Url)
      .then(dimensions => {
        const alignedBuffer = this.base64ToArrayBuffer(base64Str);
        this.sizeBeforeCompression = alignedBuffer.byteLength / 1024 / 1024;

        const startTime = Date.now();

        const encodedPNG = UPNG.encode(
          UPNG.toRGBA8(
            UPNG.decode(alignedBuffer)),
          dimensions.width,
          dimensions.height,
          this.scaleValue(this.quality, 1, 100, 1, 255));

        const base64After = this.arrayBufferToBase64(encodedPNG);
        const endTime = Date.now();

        this.compressionTime = (endTime - startTime) / 1000;

        this.imgResultAfterCompression = 'data:image/png;base64,' + base64After;
        console.log('image base64 encoded string after compression: ' + base64After);
        this.sizeAfterCompression = encodedPNG.byteLength / 1024 / 1024;
        this.compressionRatio = this.sizeAfterCompression / this.sizeBeforeCompression;
      })
      .catch(error => {
        console.error(error);
        return;
      });
  }

  private compressJpeg(base64Url: string){
    this.imgResultBeforeCompression = base64Url;
    this.sizeBeforeCompression = this.imageCompress.byteCount(base64Url) / 1024 / 1024;
    const startTime = Date.now();
    this.imageCompress
      .compressFile(base64Url, 1, this.ratio, this.quality)
      .then(compressedImage => {
        this.imgResultAfterCompression = compressedImage;
        const endTime = Date.now();
        this.sizeAfterCompression = this.imageCompress.byteCount(compressedImage) / 1024 / 1024;
        this.compressionRatio = this.sizeAfterCompression / this.sizeBeforeCompression;
        this.compressionTime = (endTime - startTime) / 1000;
      });
  }
  private base64ToArrayBuffer(base64Str: string): ArrayBuffer{
    const byteStr = atob(base64Str);
    let buffer = Uint8Array.from(byteStr, c => c.charCodeAt(0)).buffer;
    const r = buffer.byteLength % 4;
    if(r === 0){
      console.log('no need align length');
      return buffer;
    }
    const alignedLength = buffer.byteLength + (4 - r);
    const alignedBuffer = new ArrayBuffer(alignedLength);
    new Uint8Array(alignedBuffer).set(new Uint8Array(buffer)); // copy buffer to the alignedlength buffer
    return alignedBuffer;
  }
  private arrayBufferToBase64(buffer: ArrayBuffer): string{
    return btoa(
      new Uint8Array(buffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
  }
  private getImageDimensions(base64String: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = (error) => {
        reject('Failed to load image');
      };

      // Set the source of the image to the Base64 string
      img.src = base64String;
    });
  }
  private scaleValue(value: number, minOld: number, maxOld: number, minNew: number, maxNew: number): number {
    return minNew + ((value - minOld) / (maxOld - minOld)) * (maxNew - minNew);
  }
}
