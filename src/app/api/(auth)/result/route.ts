import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "../captcha/route";

function extractHtmlText(html: string): string {
  return html
    .replace(/<script\b[^<]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^<]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const GET = async (req: NextRequest) => {
  try {
    const sessionId = req.cookies.get("JSESSIONID")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session expired. Please log in.", expired: true },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const euno = searchParams.get("euno") || "100";

    const res = await axios.get(`${BASE_URL}/web/StudentSearchProcess`, {
      params: { flag: 2, euno },
      headers: {
        Cookie: `JSESSIONID=${sessionId}`,
        Accept: "application/json,text/html",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: `${BASE_URL}/web/student/studenthome.jsp`,
      },
      validateStatus: () => true,
    });

    const raw = typeof res.data === "string" ? res.data : JSON.stringify(res.data);

    try {
      const data = JSON.parse(raw);
      return NextResponse.json(data);
    } catch {
      const lower = raw.toLowerCase();

      // Check for session expiry in GGSIPU HTML
      if (
        res.status === 401 ||
        lower.includes("login") ||
        lower.includes("no session") ||
        lower.includes("session expired") ||
        lower.includes("session timeout") ||
        lower.includes("please relogin")
      ) {
        const response = NextResponse.json(
          { error: "Session expired. Please log in again.", expired: true },
          { status: 401 }
        );

        response.cookies.set("JSESSIONID", "", {
          maxAge: 0,
          path: "/api",
        });
        return response;
      }

      // Check for Account Locked / Disabled in GGSIPU HTML
      if (lower.includes("account locked") || lower.includes("account is locked") || lower.includes("disabled")) {
        return NextResponse.json(
          { error: "Your account is locked or disabled on GGSIPU portal. Please try again later.", locked: true },
          { status: 403 }
        );
      }

      // Clean HTML text extraction for any other GGSIPU error
      const cleanedError = extractHtmlText(raw);
      const userFriendlyMessage = cleanedError.length > 0 && cleanedError.length < 200
        ? cleanedError
        : "Session expired. Please log in again.";

      const response = NextResponse.json(
        { error: userFriendlyMessage, expired: true },
        { status: 401 }
      );
      response.cookies.set("JSESSIONID", "", { maxAge: 0, path: "/api" });
      return response;
    }
  } catch (err) {
    console.error("Results route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch results from GGSIPU server" },
      { status: 502 }
    );
  }
};