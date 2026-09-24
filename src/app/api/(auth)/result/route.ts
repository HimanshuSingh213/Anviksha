import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "../captcha/route";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/ApiResponse";
import { ResultData } from "@/types/result";
import * as cheerio from "cheerio";

const REQUEST_TIMEOUT = 15000;
const DEFAULT_FALLBACK_MESSAGE = "Unexpected response from GGSIPU. Please retry.";

/**
 * Extracts error message, remaining attempts, and account locked status from GGSIPU HTML response.
 *
 * @param html - Raw HTML response string from GGSIPU portal
 * @returns Parsed error message, remaining attempts count, and locked status flag
 */
function extractErrorFromHtml(html: string): { message: string; attemptsLeft?: number; locked: boolean } {
  const $ = cheerio.load(html);

  // Modern GGSIPU error container: <div class="message-box"><div class="message">...</div></div>
  const errorMessage = $(".message-box .message").first().text().trim() || $(".message").first().text().trim();

  const lower = (errorMessage || html).toLowerCase();
  const locked =
    lower.includes("account is locked") ||
    lower.includes("account locked") ||
    lower.includes("examination department") ||
    lower.includes("0 attempts left");

  if (!errorMessage) {
    return {
      message: locked ? "Your account is locked. Please visit the examination department." : DEFAULT_FALLBACK_MESSAGE,
      locked,
    };
  }

  // Check if message mentions attempts left
  const attemptsMatch = errorMessage.match(/(\d+)\s*attempts?\s*left/i);
  const attemptsLeft = attemptsMatch ? parseInt(attemptsMatch[1], 10) : undefined;

  return {
    message: errorMessage,
    attemptsLeft,
    locked: locked || attemptsLeft === 0,
  };
}

export const GET = async (req: NextRequest) => {
  // Anti-abuse: block direct browser navigation and cross-origin requests
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite === "none" || fetchSite === "cross-site") {
    return NextResponse.json({ error: "Direct API access forbidden" }, { status: 403 });
  }

  try {
    const sessionId = req.cookies.get("JSESSIONID")?.value;

    if (!sessionId) {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "Session expired. Please log in.",
        code: "SESSION_EXPIRED",
        expired: true,
      };
      const response = NextResponse.json(errPayload, { status: 401 });
      response.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
      return response;
    }

    const { searchParams } = new URL(req.url);
    const rawEuno = searchParams.get("euno") || "100";
    const euno = /^[a-zA-Z0-9_-]{1,10}$/.test(rawEuno) ? rawEuno : "100";

    const res = await axios.get(`${BASE_URL}/web/student/search`, {
      params: { flag: 2, euno },
      headers: {
        Cookie: `JSESSIONID=${sessionId}`,
        Accept: "application/json,text/html",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: `${BASE_URL}/web/student/studenthome`,
      },
      timeout: REQUEST_TIMEOUT,
      validateStatus: () => true,
    });

    const raw = typeof res.data === "string" ? res.data : JSON.stringify(res.data);

    try {
      let parsed: any = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

      // Handle new GGSIPU envelope { status: "OK", message: "..." }
      if (parsed && typeof parsed === "object") {
        if (parsed.status === "ERROR") {
          throw new Error(parsed.message || "Session expired");
        }
        if (parsed.status === "OK" && parsed.message) {
          parsed = typeof parsed.message === "string" ? JSON.parse(parsed.message) : parsed.message;
        }
      }

      const data: ResultData = parsed;

      if (!data.stprofile || !Array.isArray(data.stresult)) {
        throw new Error("Invalid data structure");
      }

      const successPayload: ApiSuccessResponse<ResultData> = {
        success: true,
        data,
      };

      return NextResponse.json(successPayload);
    } catch (parseError: any) {
      const lower = raw.toLowerCase();

      if (
        res.status === 401 ||
        lower.includes("login") ||
        lower.includes("no session") ||
        lower.includes("session expired") ||
        lower.includes("session timeout") ||
        lower.includes("please relogin")
      ) {
        const errPayload: ApiErrorResponse = {
          success: false,
          error: "Session expired. Please log in again.",
          code: "SESSION_EXPIRED",
          expired: true,
        };
        const response = NextResponse.json(errPayload, { status: 401 });
        response.cookies.set("JSESSIONID", "", { maxAge: 0, path: "/api" });
        response.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
        return response;
      }

      const errorInfo = extractErrorFromHtml(raw);

      // If HTML didn't contain an error message, use the JSON error message if available
      const errorMessage =
        errorInfo.message !== DEFAULT_FALLBACK_MESSAGE
          ? errorInfo.message
          : parseError?.message || DEFAULT_FALLBACK_MESSAGE;

      const errPayload: ApiErrorResponse = {
        success: false,
        error: errorMessage,
        code: errorInfo.locked ? "RATE_LIMITED" : "UPSTREAM_ERROR",
        locked: errorInfo.locked,
        attemptsLeft: errorInfo.attemptsLeft,
      };

      const response = NextResponse.json(errPayload, { status: errorInfo.locked ? 403 : 502 });
      response.cookies.set("JSESSIONID", "", { maxAge: 0, path: "/api" });
      response.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
      return response;
    }
  } catch (err) {
    const axiosErr = err as AxiosError;

    if (axiosErr.code === "ECONNABORTED" || axiosErr.code === "ETIMEDOUT") {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "Results request timed out. GGSIPU may be slow.",
        code: "NETWORK_ERROR",
      };
      return NextResponse.json(errPayload, { status: 504 });
    }

    if (axiosErr.code === "ECONNREFUSED" || axiosErr.code === "ENOTFOUND") {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "Cannot connect to GGSIPU. Check your connection.",
        code: "NETWORK_ERROR",
      };
      return NextResponse.json(errPayload, { status: 503 });
    }

    console.error("Results route error:", axiosErr.message);
    const errPayload: ApiErrorResponse = {
      success: false,
      error: "Failed to fetch results",
      code: "UNKNOWN",
    };
    return NextResponse.json(errPayload, { status: 500 });
  }
};