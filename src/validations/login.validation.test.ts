import { describe, it, expect } from "vitest";
import { LoginSchema, type LoginInput } from "./login.validation";

describe("login.validation.ts - Zod Schema Validation", () => {
  const validInput: LoginInput = {
    enrollment: "09414802721",
    password: "Father Name",
    captcha: "ABC123",
  };

  describe("enrollment field", () => {
    it("accepts valid 11-digit enrollment number", () => {
      const result = LoginSchema.safeParse({ ...validInput, enrollment: "12345678901" });
      expect(result.success).toBe(true);
    });

    it("rejects enrollment with less than 11 digits", () => {
      const result = LoginSchema.safeParse({ ...validInput, enrollment: "1234567890" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("11 digits");
      }
    });

    it("rejects enrollment with more than 11 digits", () => {
      const result = LoginSchema.safeParse({ ...validInput, enrollment: "123456789012" });
      expect(result.success).toBe(false);
    });

    it("rejects enrollment with non-numeric characters", () => {
      const result = LoginSchema.safeParse({ ...validInput, enrollment: "1234567890A" });
      expect(result.success).toBe(false);
    });

    it("rejects empty enrollment", () => {
      const result = LoginSchema.safeParse({ ...validInput, enrollment: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("required");
      }
    });

    it("trims whitespace from enrollment", () => {
      const result = LoginSchema.safeParse({ ...validInput, enrollment: "  12345678901  " });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enrollment).toBe("12345678901");
      }
    });
  });

  describe("password field", () => {
    it("accepts valid password", () => {
      const result = LoginSchema.safeParse({ ...validInput, password: "My Password" });
      expect(result.success).toBe(true);
    });

    it("rejects empty password", () => {
      const result = LoginSchema.safeParse({ ...validInput, password: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("required");
      }
    });

    it("trims whitespace from password", () => {
      const result = LoginSchema.safeParse({ ...validInput, password: "  My Password  " });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe("My Password");
      }
    });
  });

  describe("captcha field", () => {
    it("accepts valid captcha", () => {
      const result = LoginSchema.safeParse({ ...validInput, captcha: "ABC123" });
      expect(result.success).toBe(true);
    });

    it("rejects empty captcha", () => {
      const result = LoginSchema.safeParse({ ...validInput, captcha: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("required");
      }
    });

    it("trims whitespace from captcha", () => {
      const result = LoginSchema.safeParse({ ...validInput, captcha: "  ABC123  " });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.captcha).toBe("ABC123");
      }
    });
  });

  describe("full validation", () => {
    it("accepts completely valid input", () => {
      const result = LoginSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("rejects input with multiple invalid fields", () => {
      const result = LoginSchema.safeParse({
        enrollment: "123",
        password: "",
        captcha: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      }
    });
  });
});