import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

import { OcrComponent } from "./ocr";

describe("OcrComponent", () => {
  let component: OcrComponent;
  let fixture: ComponentFixture<OcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OcrComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

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
});
