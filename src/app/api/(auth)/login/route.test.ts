import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock dependencies before importing the route
vi.mock("axios");
vi.mock("cheerio");
vi.mock("@/validations/login.validation", () => ({
  LoginSchema: {
    safeParse: vi.fn(),
  },
}));
vi.mock("../captcha/route", () => ({
  BASE_URL: "https://examweb.ggsipu.ac.in",
}));

import { POST as loginHandler } from "@/app/api/(auth)/login/route";
import axios from "axios";
import * as cheerio from "cheerio";
import { LoginSchema } from "@/validations/login.validation";

describe("API Route: /api/login", () => {
  const mockAxios = vi.mocked(axios);
  const mockCheerio = vi.mocked(cheerio);
  const mockLoginSchema = vi.mocked(LoginSchema);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(body: object, cookies: Record<string, string> = {}) {
    const request = new NextRequest(new URL("http://localhost/api/login"), {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; "),
      },
    });
    return request;
  }

  it("returns 400 for invalid enrollment format", async () => {
    mockLoginSchema.safeParse.mockReturnValue({
      success: false,
      error: { issues: [{ message: "Enrollment number must be exactly 11 digits" }] },
    } as any);

    const req = createRequest({
      enrollment: "123",
      password: "test",
      captcha: "ABC",
    });

    const response = await loginHandler(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.code).toBe("VALIDATION_ERROR");
  });

  it("returns 401 when JSESSIONID cookie is missing", async () => {
    mockLoginSchema.safeParse.mockReturnValue({
      success: true,
      data: { enrollment: "12345678901", password: "test", captcha: "ABC" },
    });

    const req = createRequest({
      enrollment: "12345678901",
      password: "test",
      captcha: "ABC",
    });

    const response = await loginHandler(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.code).toBe("SESSION_EXPIRED");
  });

  it("returns 401 for invalid credentials", async () => {
    mockLoginSchema.safeParse.mockReturnValue({
      success: true,
      data: { enrollment: "12345678901", password: "test", captcha: "ABC" },
    });

    mockAxios.post.mockResolvedValue({
      status: 200,
      headers: { "set-cookie": [] },
      data: "<html><h2>Invalid credentials</h2></html>",
    });

    const mock$ = {
      first: () => ({ text: () => "Invalid credentials" }),
    };
    mockCheerio.load.mockReturnValue((() => mock$) as any);

    const req = createRequest(
      { enrollment: "12345678901", password: "test", captcha: "ABC" },
      { JSESSIONID: "test-session" }
    );

    const response = await loginHandler(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 403 for locked account", async () => {
    mockLoginSchema.safeParse.mockReturnValue({
      success: true,
      data: { enrollment: "12345678901", password: "test", captcha: "ABC" },
    });

    mockAxios.post.mockResolvedValue({
      status: 200,
      headers: { "set-cookie": [] },
      data: "<html><h2>Account locked 0 attempts left</h2></html>",
    });

    const mock$ = {
      first: () => ({ text: () => "Account locked 0 attempts left" }),
    };
    mockCheerio.load.mockReturnValue((() => mock$) as any);

    const req = createRequest(
      { enrollment: "12345678901", password: "test", captcha: "ABC" },
      { JSESSIONID: "test-session" }
    );

    const response = await loginHandler(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.code).toBe("RATE_LIMITED");
    expect(data.locked).toBe(true);
  });

  it("returns 504 for timeout", async () => {
    mockLoginSchema.safeParse.mockReturnValue({
      success: true,
      data: { enrollment: "12345678901", password: "test", captcha: "ABC" },
    });

    const timeoutError = new Error("timeout") as any;
    timeoutError.code = "ECONNABORTED";
    mockAxios.post.mockRejectedValue(timeoutError);

    const req = createRequest(
      { enrollment: "12345678901", password: "test", captcha: "ABC" },
      { JSESSIONID: "test-session" }
    );

    const response = await loginHandler(req);
    const data = await response.json();

    expect(response.status).toBe(504);
    expect(data.success).toBe(false);
    expect(data.code).toBe("NETWORK_ERROR");
  });
});