import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import axios from "axios";

vi.mock("axios");
vi.mock("@/types/ApiResponse", () => ({
  ApiErrorResponse: {},
  ApiSuccessResponse: {},
}));
vi.mock("../captcha/route", () => ({
  BASE_URL: "https://examweb.ggsipu.ac.in",
}));

import { GET as resultHandler } from "@/app/api/(auth)/result/route";

const mockAxios = vi.mocked(axios);

describe("API Route: /api/result", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(searchParams: Record<string, string>, cookies: Record<string, string> = {}) {
    const url = new URL("http://localhost/api/result");
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));

    const request = new NextRequest(url, {
      method: "GET",
      headers: {
        Cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; "),
      },
    });
    return request;
  }

  it("returns 401 when JSESSIONID cookie is missing", async () => {
    const req = createRequest({ euno: "100" });
    const response = await resultHandler(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.code).toBe("SESSION_EXPIRED");
  });

  it("returns parsed result data on success", async () => {
    const mockResultData = {
      stprofile: {
        nrollno: "12345678901",
        stname: "Test Student",
        byoa: 2021,
        yoa: 2021,
        prgcode: "CSE",
        prgname: "Computer Science Engineering",
        icode: "164",
        iname: "Test Institute",
      },
      stresult: [
        [1, "CS101", "DATA STRUCTURES", "25", "50", "75", "08", "5,2024", "2024-07-15"],
        [1, "CS102", "ALGORITHMS", "20", "45", "65", "08", "5,2024", "2024-07-16"],
      ],
    };

    mockAxios.get.mockResolvedValue({
      status: 200,
      data: JSON.stringify(mockResultData),
    });

    const req = createRequest({ euno: "100" }, { JSESSIONID: "valid-session" });
    const response = await resultHandler(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.stprofile.stname).toBe("Test Student");
    expect(data.data.stresult).toHaveLength(2);
  });

  it("returns 401 for expired session (HTML response)", async () => {
    mockAxios.get.mockResolvedValue({
      status: 200,
      data: "<html><body>Please login</body></html>",
    });

    const req = createRequest({ euno: "100" }, { JSESSIONID: "expired-session" });
    const response = await resultHandler(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.code).toBe("SESSION_EXPIRED");
  });

  it("returns 403 for locked account", async () => {
    mockAxios.get.mockResolvedValue({
      status: 200,
      data: "<html><body>Account locked</body></html>",
    });

    const req = createRequest({ euno: "100" }, { JSESSIONID: "valid-session" });
    const response = await resultHandler(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.code).toBe("RATE_LIMITED");
    expect(data.locked).toBe(true);
  });

  it("returns 504 for timeout", async () => {
    const timeoutError = new Error("timeout") as any;
    timeoutError.code = "ECONNABORTED";
    mockAxios.get.mockRejectedValue(timeoutError);

    const req = createRequest({ euno: "100" }, { JSESSIONID: "valid-session" });
    const response = await resultHandler(req);
    const data = await response.json();

    expect(response.status).toBe(504);
    expect(data.success).toBe(false);
    expect(data.code).toBe("NETWORK_ERROR");
  });

  it("returns 503 for connection refused", async () => {
    const connError = new Error("connection refused") as any;
    connError.code = "ECONNREFUSED";
    mockAxios.get.mockRejectedValue(connError);

    const req = createRequest({ euno: "100" }, { JSESSIONID: "valid-session" });
    const response = await resultHandler(req);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.code).toBe("NETWORK_ERROR");
  });
});