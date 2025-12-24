import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AppComponent {
  title = 'kin-ocr';
  errorMessage: string = '';
  csvData: any[] = [];
  headers: string[] = [];
  selectedFile: File | null = null;

  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    // Reset previous data and errors
    this.errorMessage = '';
    this.csvData = [];
    this.headers = [];
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

        // Parse first line as headers
        this.headers = this.parseCSVLine(lines[0]);

        // If there's only one line, treat it as data with auto-generated column headers
        if (lines.length === 1) {
          const values = this.headers;
          this.headers = values.map((_, index) => `Column ${index + 1}`);
          const row: any = {};
          this.headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          this.csvData.push(row);
        } else {
          // Parse data rows (starting from line 2)
          for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const row: any = {};

            this.headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });

            this.csvData.push(row);
          }
        }

        console.log('Headers:', this.headers);
        console.log('Data:', this.csvData);
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

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result.map((val) => val.trim());
  }
}
