import { Component } from '@angular/core';
import { compressionFile } from './utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  imgResultBeforeCompression: string = '';
  imgResultAfterCompression: string = '';
  sizeBeforeCompression: number = 0;
  sizeAfterCompression: number = 0;
  compressionRatio: number = 0;
  compressionTime: number = 0;
  imageType: string = 'image/jpeg'; // Default compression type
  quality: number = 0.5; // Default quality
  ratio: number = 100;

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;

    // Clear all state at the beginning
    this.imgResultBeforeCompression = '';
    this.imgResultAfterCompression = '';
    this.sizeBeforeCompression = 0;
    this.sizeAfterCompression = 0;
    this.compressionRatio = 0;
    this.compressionTime = 0;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.sizeBeforeCompression = file.size / 1024 / 1024; // Size in MB

      // Convert file to Base64 to display the original image
      const reader = new FileReader();
      reader.onload = () => {
        this.imgResultBeforeCompression = reader.result as string;
      };
      reader.readAsDataURL(file);

      // Start compression
      try {
        const startTime = Date.now();

        const compressedFile = await compressionFile(
          file,
          this.quality
        );

        const endTime = Date.now();
        this.compressionTime = (endTime - startTime) / 1000;

        // Convert compressed file to Base64 for display
        const compressedFileReader = new FileReader();
        compressedFileReader.onload = () => {
          this.imgResultAfterCompression = compressedFileReader.result as string; // Compressed image
          this.sizeAfterCompression = compressedFile.size / 1024 / 1024; // Size in MB
          this.compressionRatio =
            this.sizeAfterCompression / this.sizeBeforeCompression; // Compression ratio
        };
        compressedFileReader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Image compression failed:', error);
      }
    }
  }
}
