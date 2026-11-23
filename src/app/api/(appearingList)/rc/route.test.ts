import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import axios from "axios";

vi.mock("axios");
vi.mock("@/types/ApiResponse", () => ({
  ApiErrorResponse: {},
  ApiSuccessResponse: {},
}));
vi.mock("../../(auth)/captcha/route", () => ({
  BASE_URL: "https://examweb.ggsipu.ac.in",
}));

import { GET as rcHandler } from "@/app/api/(appearingList)/rc/route";

const mockAxios = vi.mocked(axios);

describe("API Route: /api/rc", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(cookies: Record<string, string> = {}) {
    const url = new URL("http://localhost/api/rc");
    const request = new NextRequest(url, {
      method: "GET",
      headers: {
        Cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; "),
      },
    });
    return request;
  }

  it("returns 401 when JSESSIONID cookie is missing", async () => {
    const req = createRequest({});
    const response = await rcHandler(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.code).toBe("SESSION_EXPIRED");
  });

  it("returns parsed appearing list array on success", async () => {
    const mockRC = [
      {
        nrollno: "12345678901",
        stname: "Test Student",
        euno: 3,
        papercode: "ICT201T",
        papername: "FOUNDATIONS OF COMPUTER SCIENCE",
        fee: 0,
      },
      {
        nrollno: "12345678901",
        stname: "Test Student",
        euno: 3,
        papercode: "ICT203T",
        papername: "DATABASE MANAGEMENT SYSTEMS",
        fee: 0,
      },
      {
        nrollno: "12345678901",
        stname: "Test Student",
        euno: 3,
        papercode: "ICT203P",
        papername: "DATABASE MANAGEMENT SYSTEMS LAB",
        fee: 0,
      },
    ];

    mockAxios.get.mockResolvedValue({
      status: 200,
      data: JSON.stringify(mockRC),
    });

    const req = createRequest({ JSESSIONID: "valid-session" });
    const response = await rcHandler(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(3);
    expect(data.data[0].stname).toBe("Test Student");
    expect(data.data[0].papercode).toBe("ICT201T");
    expect(data.data).toEqual(mockRC);
  });

  it("returns 200 with empty list when GGSIPU reports no record found", async () => {
    mockAxios.get.mockResolvedValue({
      status: 200,
      data: JSON.stringify({ status: "ERROR", message: "No Record Found" }),
    });

    const req = createRequest({ JSESSIONID: "valid-session" });
    const response = await rcHandler(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it("returns 401 when upstream returns HTML login redirect", async () => {
    mockAxios.get.mockResolvedValue({
      status: 200,
      data: "<html><body>Please login to view student home</body></html>",
    });

    const req = createRequest({ JSESSIONID: "expired-session" });
    const response = await rcHandler(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.code).toBe("SESSION_EXPIRED");
  });

  it("returns 502 (not 401) when upstream returns a non-session HTML error page", async () => {
    mockAxios.get.mockResolvedValue({
      status: 200,
      data: "<html><body><h1>Internal Server Error</h1><p>No static resource search/RC</p></body></html>",
    });

    const req = createRequest({ JSESSIONID: "valid-session" });
    const response = await rcHandler(req);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.success).toBe(false);
    expect(data.code).toBe("UPSTREAM_ERROR");
  });

  it("returns 504 on request timeout", async () => {
    const timeoutError = new Error("timeout") as any;
    timeoutError.code = "ECONNABORTED";
    mockAxios.get.mockRejectedValue(timeoutError);

    const req = createRequest({ JSESSIONID: "valid-session" });
    const response = await rcHandler(req);
    const data = await response.json();

    expect(response.status).toBe(504);
    expect(data.code).toBe("NETWORK_ERROR");
  });

  it("returns 503 when connection refused", async () => {
    const connError = new Error("refused") as any;
    connError.code = "ECONNREFUSED";
    mockAxios.get.mockRejectedValue(connError);

    const req = createRequest({ JSESSIONID: "valid-session" });
    const response = await rcHandler(req);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.code).toBe("NETWORK_ERROR");
  });
});
