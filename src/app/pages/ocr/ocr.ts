import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ocr',
  templateUrl: './ocr.html',
  styleUrl: './ocr.scss',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class OcrComponent {
  errorMessage: string = '';
  policies: { policyNumber: number; isValid: boolean }[] = [];
  selectedFile: File | null = null;

  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    // Reset previous data and errors
    this.errorMessage = '';
    this.policies = [];
    this.selectedFile = null;

    if (!file) {
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      this.errorMessage = 'Please select a valid CSV file.';
      input.value = '';
      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.errorMessage = `File size exceeds 2MB. Your file is ${(
        file.size /
        (1024 * 1024)
      ).toFixed(2)}MB.`;
      input.value = '';
      return;
    }

    // Store the valid file
    this.selectedFile = file;
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first.';
      return;
    }

    this.errorMessage = '';
    this.parseCSV(this.selectedFile);
  }

  private parseCSV(file: File): void {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter((line) => line.trim() !== '');

        if (lines.length === 0) {
          this.errorMessage = 'The CSV file is empty.';
          return;
        }

        if (lines.length > 1) {
          this.errorMessage =
            'CSV is formatted incorrectly: only a single line of comma-separated values is allowed.';
          return;
        }

        // Parse the single line into policy numbers
        const values = lines[0]
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v !== '');
        this.policies = values.map((val) => ({
          policyNumber: Number(val),
          isValid: true,
        }));

        console.log('Policies:', this.policies);
      } catch (error) {
        this.errorMessage =
          'Error parsing CSV file. Please ensure it is properly formatted.';
        console.error('CSV parsing error:', error);
      }
    };

    reader.onerror = () => {
      this.errorMessage = 'Error reading file.';
    };

    reader.readAsText(file);
  }
}
