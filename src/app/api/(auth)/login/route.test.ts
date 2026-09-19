import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import axios from "axios";
import { LoginSchema } from "@/validations/login.validation";

// Mock axios and validation schema
vi.mock("axios");
vi.mock("@/validations/login.validation", () => ({
  LoginSchema: {
    safeParse: vi.fn(),
  },
}));
vi.mock("../captcha/route", () => ({
  BASE_URL: "https://examweb.ggsipu.ac.in",
}));

import { POST as loginHandler } from "@/app/api/(auth)/login/route";

describe("API Route: /api/login", () => {
  const mockAxios = vi.mocked(axios);
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

  function mockMessageHtml(message: string): string {
    return `<div class="message-box"><div class="message">${message}</div></div>`;
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

  it("returns 401 and extracts attempts left for wrong password", async () => {
    mockLoginSchema.safeParse.mockReturnValue({
      success: true,
      data: { enrollment: "12345678901", password: "wrong-password", captcha: "ABC" },
    });

    mockAxios.post.mockResolvedValue({
      status: 200,
      headers: { "set-cookie": [] },
      data: mockMessageHtml("Login Error! 2 attempts left."),
    });

    const req = createRequest(
      { enrollment: "12345678901", password: "wrong-password", captcha: "ABC" },
      { JSESSIONID: "test-session" }
    );

    const response = await loginHandler(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.code).toBe("INVALID_CREDENTIALS");
    expect(data.error).toBe("Login Error! 2 attempts left.");
    expect(data.attemptsLeft).toBe(2);
    expect(data.locked).toBe(false);
  });

  it("returns 401 for invalid captcha", async () => {
    mockLoginSchema.safeParse.mockReturnValue({
      success: true,
      data: { enrollment: "12345678901", password: "test", captcha: "WRONG" },
    });

    mockAxios.post.mockResolvedValue({
      status: 200,
      headers: { "set-cookie": [] },
      data: mockMessageHtml("Invalid Captcha!"),
    });

    const req = createRequest(
      { enrollment: "12345678901", password: "test", captcha: "WRONG" },
      { JSESSIONID: "test-session" }
    );

    const response = await loginHandler(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.code).toBe("INVALID_CAPTCHA");
    expect(data.error).toBe("Invalid Captcha!");
  });

  it("returns 403 when account is locked", async () => {
    mockLoginSchema.safeParse.mockReturnValue({
      success: true,
      data: { enrollment: "12345678901", password: "test", captcha: "ABC" },
    });

    mockAxios.post.mockResolvedValue({
      status: 200,
      headers: { "set-cookie": [] },
      data: mockMessageHtml("Your account is locked. Please visit examination department"),
    });

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

  it("returns 200 on successful login with redirect to studenthome", async () => {
    mockLoginSchema.safeParse.mockReturnValue({
      success: true,
      data: { enrollment: "12345678901", password: "correct-password", captcha: "ABC" },
    });

    mockAxios.post.mockResolvedValue({
      status: 302,
      headers: {
        location: "https://examweb.ggsipu.ac.in/web/student/studenthome",
        "set-cookie": ["JSESSIONID=new-session; Path=/web; HttpOnly"],
      },
      data: "",
    });

    const req = createRequest(
      { enrollment: "12345678901", password: "correct-password", captcha: "ABC" },
      { JSESSIONID: "initial-session" }
    );

    const response = await loginHandler(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(response.cookies.get("JSESSIONID")?.value).toBe("new-session");
    expect(response.cookies.get("auth_session")?.value).toBe("active");
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