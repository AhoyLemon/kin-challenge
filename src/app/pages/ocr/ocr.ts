import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-ocr",
  templateUrl: "./ocr.html",
  styleUrl: "./ocr.scss",
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class OcrComponent {
  private http = inject(HttpClient);

  validationStates = {
    isValidFile: "default" as "default" | "passed" | "failed",
    isSizeValid: "default" as "default" | "passed" | "failed",
    hasInvalidCharacters: "default" as "default" | "passed" | "failed",
  };

  errorStatus = {
    hasErrors: false,
    isTooBig: false,
    isInvalidFile: false,
    isTooManyRows: false,
    isEmpty: false,
    messages: [] as string[],
  };

  policies: { policyNumber: string; isValid: boolean }[] = [];
  errorMessage: string = "";
  selectedFile: File | null = null;

  submissionStatus: "idle" | "submitting" | "success" | "error" = "idle";
  submissionDetails: { resourceId: number | null; policyCount: number } | null = null;
  submittedResourceId: number | null = null;

  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

  get validCount(): number {
    return this.policies.filter((p) => p.isValid).length;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    // Reset previous data and errors
    this.errorMessage = "";
    this.policies = [];
    this.selectedFile = null;
    this.submissionStatus = "idle";
    this.submissionDetails = null;
    this.submittedResourceId = null;
    this.errorStatus = {
      hasErrors: false,
      isTooBig: false,
      isInvalidFile: false,
      isTooManyRows: false,
      isEmpty: false,
      messages: [],
    };
    this.validationStates = {
      isValidFile: "default",
      isSizeValid: "default",
      hasInvalidCharacters: "default",
    };

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      this.validationStates.isValidFile = "failed";
      this.errorStatus.hasErrors = true;
      this.errorStatus.isInvalidFile = true;
      this.errorStatus.messages.push("Your file does not appear to be a CSV file.");
      this.errorMessage = "Please select a valid CSV file.";
      input.value = "";
      return;
    }

    if (file.size > this.MAX_FILE_SIZE) {
      this.validationStates.isSizeValid = "failed";
      this.errorStatus.hasErrors = true;
      this.errorStatus.isTooBig = true;
      this.errorStatus.messages.push(`Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum file size is 2MB.`);
      this.errorMessage = `File size exceeds 2MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`;
      input.value = "";
      return;
    }
    this.validationStates.isSizeValid = "passed";
    this.selectedFile = file;
    this.parseCSV(file);
  }

  private parseCSV(file: File): void {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split("\n").filter((line) => line.trim() !== "");

        if (lines.length === 0) {
          this.validationStates.isValidFile = "failed";
          this.errorStatus.hasErrors = true;
          this.errorStatus.isEmpty = true;
          this.errorStatus.messages.push("The CSV file is empty.");
          return;
        }

        if (!/^[\d,\s]+$/.test(csv.trim())) {
          this.validationStates.hasInvalidCharacters = "failed";
          this.errorStatus.hasErrors = true;
          this.errorStatus.isInvalidFile = true;
          this.errorStatus.messages.push("The file must only contain numbers, commas, and spaces.");
          return;
        }

        this.validationStates.hasInvalidCharacters = "passed";
        this.validationStates.isValidFile = "passed";

        const values = lines
          .join(",")
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v !== "");

        this.policies = values.map((val) => ({
          policyNumber: val,
          isValid: this.validateChecksum(val),
        }));
      } catch (error) {
        this.validationStates.isValidFile = "failed";
        this.errorStatus.hasErrors = true;
        this.errorStatus.messages.push("Error parsing CSV file. Please ensure it is properly formatted.");
      }
    };

    reader.onerror = () => {
      this.validationStates.isValidFile = "failed";
      this.errorStatus.hasErrors = true;
      this.errorStatus.messages.push("Error reading file.");
    };

    reader.readAsText(file);
  }

  clearFile(fileInput: HTMLInputElement): void {
    fileInput.value = "";
    this.selectedFile = null;
    this.policies = [];
    this.errorMessage = "";
    this.submissionStatus = "idle";
    this.submissionDetails = null;
    this.submittedResourceId = null;
    this.errorStatus = {
      hasErrors: false,
      isTooBig: false,
      isInvalidFile: false,
      isTooManyRows: false,
      isEmpty: false,
      messages: [],
    };
    this.validationStates = {
      isValidFile: "default",
      isSizeValid: "default",
      hasInvalidCharacters: "default",
    };
  }

  /**
   * Validates a policy number using checksum algorithm.
   * Formula: (d1 + (2*d2) + (3*d3) + ... + (9*d9)) mod 11 = 0
   * Where d1 is the rightmost digit, d2 is second from right, etc.
   */
  private validateChecksum(policyNumberStr: string): boolean {
    if (policyNumberStr.length !== 9) {
      return false;
    }

    const digits = policyNumberStr.split("").map(Number);
    let sum = 0;

    for (let i = 0; i < digits.length; i++) {
      const position = i + 1;
      const digit = digits[digits.length - 1 - i];
      sum += position * digit;
    }

    return sum % 11 === 0;
  }

  submitPolicyNumbers(): void {
    this.submissionStatus = "submitting";
    this.submissionDetails = {
      resourceId: null,
      policyCount: 0,
    };
    this.submittedResourceId = null;

    const startTime = Date.now();

    this.http
      .post<{ id: number; title: string; body: string; userId: number }>("https://jsonplaceholder.typicode.com/posts", {
        title: "Policy Numbers Submission",
        body: JSON.stringify(this.policies),
        userId: 1,
      })
      .subscribe({
        next: (response) => {
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, 2000 - elapsed);

          setTimeout(() => {
            this.submissionStatus = "success";
            this.submittedResourceId = response.id;
            this.submissionDetails = { resourceId: response.id, policyCount: this.policies.length };
          }, remainingTime);
        },
        error: () => {
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, 2000 - elapsed);

          setTimeout(() => {
            this.submissionStatus = "error";
          }, remainingTime);
        },
      });
  }
}
