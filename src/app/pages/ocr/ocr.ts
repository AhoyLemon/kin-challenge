import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-ocr",
  templateUrl: "./ocr.html",
  styleUrl: "./ocr.scss",
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class OcrComponent {
  validationState: "default" | "passed" | "failed" = "default";

  validationStates = {
    isValidFile: "default" as "default" | "passed" | "failed",
    isSizeValid: "default" as "default" | "passed" | "failed",
    isSingleRow: "default" as "default" | "passed" | "failed",
  };

  errorStatus = {
    hasErrors: false,
    isTooBig: false,
    isInvalidFile: false,
    isTooManyRows: false,
    isEmpty: false,
    messages: [] as string[],
  };
  policies: { policyNumber: number; isValid: boolean }[] = [];
  errorMessage: string = "";
  selectedFile: File | null = null;

  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    // Reset previous data and errors
    this.errorMessage = "";
    this.policies = [];
    this.selectedFile = null;
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
      isSingleRow: "default",
    };

    if (!file) {
      return;
    }

    // Validate file type (extension check - content validation happens in parseCSV)
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      this.validationStates.isValidFile = "failed";
      this.errorStatus.hasErrors = true;
      this.errorStatus.isInvalidFile = true;
      this.errorStatus.messages.push("Your file does not appear to be a CSV file.");
      this.errorMessage = "Please select a valid CSV file.";
      input.value = "";
      return;
    }
    // Don't set isValidFile to "passed" yet - wait for content validation in parseCSV

    // Validate file size
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

    // Store the valid file
    this.selectedFile = file;
    // Parse and display immediately
    this.parseCSV(file);
  }

  // onSubmit is no longer needed

  private parseCSV(file: File): void {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const csv = e.target?.result as string;

        // Check if content looks like valid CSV (comma-separated values)
        // This will catch files like JSON that have .csv extension
        const lines = csv.split("\n").filter((line) => line.trim() !== "");

        if (lines.length === 0) {
          this.validationStates.isValidFile = "failed";
          this.validationStates.isSingleRow = "failed";
          this.errorStatus.hasErrors = true;
          this.errorStatus.isEmpty = true;
          this.errorStatus.messages.push("The CSV file is empty.");
          return;
        }

        // Check if first line looks like CSV (contains commas, not JSON/XML markers)
        const firstLine = lines[0].trim();
        if (!/^[\d,]+$/.test(firstLine)) {
          this.validationStates.isValidFile = "failed";
          this.errorStatus.hasErrors = true;
          this.errorStatus.isInvalidFile = true;
          this.errorStatus.messages.push("The file must only contain numbers and commas.");
          return;
        }

        // File content appears to be valid CSV format
        this.validationStates.isValidFile = "passed";

        if (lines.length > 1) {
          this.validationStates.isSingleRow = "failed";
          this.errorStatus.hasErrors = true;
          this.errorStatus.isTooManyRows = true;
          this.errorStatus.messages.push(`Your file has ${lines.length} rows. Only a single row of comma-separated values is allowed.`);
          return;
        }

        // Single row validation passed
        this.validationStates.isSingleRow = "passed";

        // Parse the single line into policy numbers
        const values = lines[0]
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v !== "");
        this.policies = values.map((val) => ({
          policyNumber: Number(val),
          isValid: true,
        }));

        console.log("Policies:", this.policies);
      } catch (error) {
        this.validationStates.isValidFile = "failed";
        this.validationStates.isSingleRow = "failed";
        this.errorStatus.hasErrors = true;
        this.errorStatus.messages.push("Error parsing CSV file. Please ensure it is properly formatted.");
        console.error("CSV parsing error:", error);
      }
    };

    reader.onerror = () => {
      this.validationStates.isValidFile = "failed";
      this.validationStates.isSingleRow = "failed";
      this.errorStatus.hasErrors = true;
      this.errorStatus.messages.push("Error reading file.");
    };

    reader.readAsText(file);
  }
}
