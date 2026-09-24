import * as cheerio from "cheerio";
import { LoginSchema } from "@/validations/login.validation";
import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { BASE_URL } from "../captcha/route";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/ApiResponse";

const hashPassword = (password: string, captcha: string): string => {
  return createHash("sha256").update(password + captcha).digest("base64");
};

const REQUEST_TIMEOUT = 10000;

// New Error HTML body

// <body>
//     <div id="main-container">

//         <div class="login-card">

//             <!-- Standardized Header -->
//             <div class="login-header">
//                 <img src="/web/images/ggsipulogo.png" alt="University Logo" class="logo">
//                 <div class="university-details">
//                     <h2 class="uni-name">Guru Gobind Singh Indraprastha University</h2>
//                     <h3 class="dept-name">Message</h3>
//                 </div>
//             </div>

//             <!-- Message Content Area -->
//             <div class="modern-form" style="text-align: center;">

//                 <div class="message-box">
//                     <div class="message-type  error">ERROR</div>

//                     <div class="message">Invalid Captcha!</div>
//                 </div>

//                 <!-- Action Button -->
//                 <a href="/web/login" class="btn-login" style="text-decoration: none; display: block;">Go to
//                     Login</a>

//             </div>
//         </div>

//     </div>

// </body>

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
      message: locked ? "Your account is locked. Please visit the examination department." : "Login failed. Please check your credentials.",
      locked,
    };
  }

  // Check if message mentions attempts left (e.g. "Login Error! 2 attempts left.")
  const attemptsMatch = errorMessage.match(/(\d+)\s*attempts?\s*left/i);
  const attemptsLeft = attemptsMatch ? parseInt(attemptsMatch[1], 10) : undefined;

  return {
    message: errorMessage,
    attemptsLeft,
    locked: locked || attemptsLeft === 0,
  };
}

export const POST = async (req: NextRequest) => {
  // Anti-abuse: block direct browser navigation and cross-origin requests
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite === "none" || fetchSite === "cross-site") {
    return NextResponse.json({ error: "Direct API access forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validationResult = LoginSchema.safeParse(body);

    if (!validationResult.success) {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: validationResult.error.issues[0]?.message || "Invalid input format",
        code: "VALIDATION_ERROR",
      };
      return NextResponse.json(errPayload, { status: 400 });
    }

    const sessionId = req.cookies.get("JSESSIONID")?.value;
    if (!sessionId) {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "Session expired. Please refresh CAPTCHA.",
        expired: true,
        code: "SESSION_EXPIRED",
      };
      return NextResponse.json(errPayload, { status: 401 });
    }

    const hashedPass = hashPassword(
      validationResult.data.password,
      validationResult.data.captcha
    );

    const res = await axios.post(
      `${BASE_URL}/web/login`,
      new URLSearchParams({
        username: validationResult.data.enrollment,
        passwd: hashedPass,
        captcha: validationResult.data.captcha,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: `JSESSIONID=${sessionId}`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: `${BASE_URL}/web/`,
          Origin: BASE_URL,
        },
        timeout: REQUEST_TIMEOUT,
        maxRedirects: 0,
        validateStatus: (status) => status === 302 || status === 200,
      }
    );

    const setCookie = res.headers["set-cookie"];
    let newSessionId: string | null = null;

    if (setCookie) {
      const cookieStr = Array.isArray(setCookie) ? setCookie[0] : String(setCookie);
      const match = cookieStr?.match(/JSESSIONID=([^;]+)/);
      if (match) newSessionId = match[1];
    }

    const location = res.headers["location"] || "";
    const success = res.status === 302 && location.includes("studenthome");

    if (!success) {
      const rawHtml = typeof res.data === "string" ? res.data : "";
      const lower = rawHtml.toLowerCase();
      const errorInfo = extractErrorFromHtml(rawHtml);

      let code: 'INVALID_CREDENTIALS' | 'INVALID_CAPTCHA' | 'SESSION_EXPIRED' | 'RATE_LIMITED' = 'INVALID_CREDENTIALS';

      if (errorInfo.locked) {
        code = "RATE_LIMITED";
      } else if (lower.includes("captcha")) {
        code = "INVALID_CAPTCHA";
      } else if (lower.includes("session") || lower.includes("expired") || (res.status === 302 && !location.includes("studenthome"))) {
        code = "SESSION_EXPIRED";
      }

      const errPayload: ApiErrorResponse = {
        success: false,
        error: errorInfo.message,
        code,
        expired: true,
        locked: errorInfo.locked,
        attemptsLeft: errorInfo.attemptsLeft,
      };

      return NextResponse.json(errPayload, { status: errorInfo.locked ? 403 : 401 });
    }

    const payload: ApiSuccessResponse<{ message: string }> = {
      success: true,
      data: { message: "Authenticated successfully" },
    };

    const response = NextResponse.json(payload);
    const activeSessionId = newSessionId || sessionId;

    response.cookies.set("JSESSIONID", activeSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600,
      path: "/api",
    });

    response.cookies.set("auth_session", "active", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600,
      path: "/",
    });

    return response;
  } catch (err) {
    const axiosErr = err as AxiosError;

    if (axiosErr.code === "ECONNABORTED" || axiosErr.code === "ETIMEDOUT") {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "GGSIPU login timed out. Please retry.",
        code: "NETWORK_ERROR",
      };
      return NextResponse.json(errPayload, { status: 504 });
    }

    if (axiosErr.response?.status && axiosErr.response.status >= 500) {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "GGSIPU portal is down. Please try later.",
        code: "UPSTREAM_ERROR",
      };
      return NextResponse.json(errPayload, { status: 502 });
    }

    console.error("Login proxy error:", axiosErr.message);
    const errPayload: ApiErrorResponse = {
      success: false,
      error: "Internal server error",
      code: "UNKNOWN",
    };
    return NextResponse.json(errPayload, { status: 500 });
  }
};