import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting, HttpTestingController } from "@angular/common/http/testing";

import { OcrComponent } from "./ocr";

describe("OcrComponent", () => {
  let component: OcrComponent;
  let fixture: ComponentFixture<OcrComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OcrComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OcrComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  /**
   * File Validation Errors Tests
   *
   * Tests various error conditions that should prevent file processing:
   *
   * - error-badfile.csv: Contains invalid characters (JSON instead of CSV data)
   * - error-empty.csv: Empty file with no content
   * - error-filetoobig.csv: File exceeds 2MB size limit
   * - error-filetype.xml: Wrong file type (XML instead of CSV)
   *
   * Each test verifies appropriate error messages are displayed and no policies are parsed.
   */
  describe("File Validation Errors", () => {
    it("should reject files with invalid characters (error-badfile.csv)", async () => {
      const response = await fetch("/base/test-files/error-badfile.csv");
      const csvContent = await response.text();
      const file = new File([csvContent], "error-badfile.csv", { type: "text/csv" });

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });

      const event = { target: fileInput } as unknown as Event;
      component.onFileSelected(event);

      // Wait for file processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.errorStatus.hasErrors).toBe(true);
      expect(component.validationStates.hasInvalidCharacters).toBe("failed");
      expect(component.errorStatus.messages).toContain("The file must only contain numbers, commas, and spaces.");
      expect(component.policies.length).toBe(0);
    });

    it("should reject empty files (error-empty.csv)", async () => {
      const response = await fetch("/base/test-files/error-empty.csv");
      const csvContent = await response.text();
      const file = new File([csvContent], "error-empty.csv", { type: "text/csv" });

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });

      const event = { target: fileInput } as unknown as Event;
      component.onFileSelected(event);

      // Wait for file processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.errorStatus.hasErrors).toBe(true);
      expect(component.errorStatus.isEmpty).toBe(true);
      expect(component.validationStates.isValidFile).toBe("failed");
      expect(component.errorStatus.messages).toContain("The CSV file is empty.");
      expect(component.policies.length).toBe(0);
    });

    it("should reject files over 2MB (error-filetoobig.csv)", async () => {
      const response = await fetch("/base/test-files/error-filetoobig.csv");
      const csvContent = await response.text();
      const file = new File([csvContent], "error-filetoobig.csv", { type: "text/csv" });

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });

      const event = { target: fileInput } as unknown as Event;
      component.onFileSelected(event);

      // Wait for file processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.errorStatus.hasErrors).toBe(true);
      expect(component.errorStatus.isTooBig).toBe(true);
      expect(component.validationStates.isSizeValid).toBe("failed");
      expect(component.errorStatus.messages.length).toBeGreaterThan(0);
      expect(component.errorStatus.messages[0]).toContain("Maximum file size is 2MB");
      expect(component.policies.length).toBe(0);
    });

    it("should reject non-CSV files (error-filetype.xml)", async () => {
      const response = await fetch("/base/test-files/error-filetype.xml");
      const xmlContent = await response.text();
      const file = new File([xmlContent], "error-filetype.xml", { type: "text/xml" });

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });

      const event = { target: fileInput } as unknown as Event;
      component.onFileSelected(event);

      // Wait for file processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.errorStatus.hasErrors).toBe(true);
      expect(component.errorStatus.isInvalidFile).toBe(true);
      expect(component.validationStates.isValidFile).toBe("failed");
      expect(component.errorStatus.messages).toContain("Your file does not appear to be a CSV file.");
      expect(component.policies.length).toBe(0);
    });
  });

  /**
   * CSV Checksum Validation Tests
   *
   * Tests the checksum algorithm that validates 9-digit policy numbers using the formula:
   * (d1 + 2*d2 + 3*d3 + ... + 9*d9) mod 11 = 0
   *
   * - checksum-invalid.csv: All 10 policies should fail validation
   * - checksum-valid.csv: All 10 policies should pass validation
   * - checksum-mixed.csv: Mix of valid and invalid policies, with specific known values tested
   */
  describe("CSV Checksum Validation", () => {
    it("checksum-invalid numbers invalidated", async () => {
      const response = await fetch("/base/test-files/checksum-invalid.csv");
      const csvContent = await response.text();
      const file = new File([csvContent], "checksum-invalid.csv", { type: "text/csv" });

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });

      const event = { target: fileInput } as unknown as Event;
      component.onFileSelected(event);

      // Wait for file processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.policies.length).toBe(10);
      expect(component.policies.every((p) => !p.isValid)).toBe(true);
      expect(component.validCount).toBe(0);
    });

    it("checksum-valid numbers validated", async () => {
      const response = await fetch("/base/test-files/checksum-valid.csv");
      const csvContent = await response.text();
      const file = new File([csvContent], "checksum-valid.csv", { type: "text/csv" });

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });

      const event = { target: fileInput } as unknown as Event;
      component.onFileSelected(event);

      // Wait for file processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.policies.length).toBe(10);
      expect(component.policies.every((p) => p.isValid)).toBe(true);
      expect(component.validCount).toBe(10);
    });

    it("checksum-mixed numbers are a mixture of valid and invalid", async () => {
      const response = await fetch("/base/test-files/checksum-mixed.csv");
      const csvContent = await response.text();
      const file = new File([csvContent], "checksum-mixed.csv", { type: "text/csv" });

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });

      const event = { target: fileInput } as unknown as Event;
      component.onFileSelected(event);

      // Wait for file processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.policies.length).toBe(10);

      // Should have both valid and invalid policies
      const validPolicies = component.policies.filter((p) => p.isValid);
      const invalidPolicies = component.policies.filter((p) => !p.isValid);

      expect(validPolicies.length).toBeGreaterThan(0);
      expect(invalidPolicies.length).toBeGreaterThan(0);
      expect(validPolicies.length + invalidPolicies.length).toBe(10);

      // Verify specific policy numbers that should be valid (checksum divisible by 11)
      const validPolicy1 = component.policies.find((p) => p.policyNumber === "000000000");
      expect(validPolicy1?.isValid).toBe(true);

      const validPolicy2 = component.policies.find((p) => p.policyNumber === "711111111");
      expect(validPolicy2?.isValid).toBe(true);

      const validPolicy3 = component.policies.find((p) => p.policyNumber === "123456789");
      expect(validPolicy3?.isValid).toBe(true);

      // Verify specific policy numbers that should be invalid
      const invalidPolicy1 = component.policies.find((p) => p.policyNumber === "111111111");
      expect(invalidPolicy1?.isValid).toBe(false);
    });
  });

  /**
   * API Submission Tests
   *
   * Tests the submission of policy numbers to the API endpoint.
   * Uses HttpTestingController to mock HTTP responses without making real network calls.
   *
   * - Success scenario: Verifies that a successful API response displays the resource ID in the DOM
   * - Failure scenario: Verifies that API errors display appropriate error messages in the DOM
   *
   * Both tests include the 2-second minimum delay and verify the actual rendered HTML elements.
   */
  describe("API Submission", () => {
    it("should successfully submit policy numbers and display resource ID", async () => {
      // Load the file
      const response = await fetch("/base/test-files/checksum-mixed.csv");
      const csvContent = await response.text();
      const file = new File([csvContent], "checksum-mixed.csv", { type: "text/csv" });

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });

      const event = { target: fileInput } as unknown as Event;
      component.onFileSelected(event);

      // Wait for file processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Submit the policy numbers
      component.submitPolicyNumbers();

      // Expect HTTP POST request
      const req = httpMock.expectOne("https://jsonplaceholder.typicode.com/posts");
      expect(req.request.method).toBe("POST");

      // Respond with mock successful response
      req.flush({ id: 101, title: "Policy Numbers Submission", body: "test", userId: 1 });

      // Wait for the 2-second delay
      await new Promise((resolve) => setTimeout(resolve, 2100));

      // Verify success state
      expect(component.submissionStatus).toBe("success");
      expect(component.submittedResourceId).toBe(101);
      expect(component.submissionDetails?.resourceId).toBe(101);
      expect(component.submissionDetails?.policyCount).toBe(10);

      // Trigger change detection and verify DOM
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const successSection = compiled.querySelector(".submission-message.success");
      expect(successSection).toBeTruthy();

      const successHeader = successSection.querySelector("h2");
      expect(successHeader?.textContent).toContain("Submission Successful");

      const resourceIdElement = successSection.querySelector(".resource-id");
      expect(resourceIdElement?.textContent?.trim()).toBe("101");
    });

    it("should handle API submission failure", async () => {
      // Load the file
      const response = await fetch("/base/test-files/checksum-mixed.csv");
      const csvContent = await response.text();
      const file = new File([csvContent], "checksum-mixed.csv", { type: "text/csv" });

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });

      const event = { target: fileInput } as unknown as Event;
      component.onFileSelected(event);

      // Wait for file processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Submit the policy numbers
      component.submitPolicyNumbers();

      // Expect HTTP POST request
      const req = httpMock.expectOne("https://jsonplaceholder.typicode.com/posts");
      expect(req.request.method).toBe("POST");

      // Respond with error
      req.flush("Server error", { status: 500, statusText: "Internal Server Error" });

      // Wait for the 2-second delay
      await new Promise((resolve) => setTimeout(resolve, 2100));

      // Verify error state
      expect(component.submissionStatus).toBe("error");

      // Trigger change detection and verify DOM
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const errorSection = compiled.querySelector(".submission-message.error");
      expect(errorSection).toBeTruthy();

      const errorHeader = errorSection.querySelector("h2");
      expect(errorHeader?.textContent).toContain("Submission Failed");

      const errorMessage = errorSection.querySelector("p");
      expect(errorMessage?.textContent).toContain("Failed to submit policy numbers");
    });
  });
});
