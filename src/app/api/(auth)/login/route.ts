import { LoginSchema } from "@/validations/login.validation";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { BASE_URL } from "../captcha/route";

const hashPassword = (password: string, captcha: string): string => {
  return createHash("sha256").update(password + captcha).digest("base64");
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validationResult = LoginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.issues[0]?.message || "Invalid input format",
        },
        { status: 400 }
      );
    }

    const sessionId = req.cookies.get("JSESSIONID")?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session expired. Please refresh the CAPTCHA.", expired: true },
        { status: 401 }
      );
    }

    const hashedPass = hashPassword(
      validationResult.data.password,
      validationResult.data.captcha
    );

    const res = await axios.post(
      `${BASE_URL}/web/Login`,
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
          Referer: `${BASE_URL}/web/Login`,
          Origin: BASE_URL,
        },
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
      return NextResponse.json(
        { error: "Invalid credentials or CAPTCHA", expired: true },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Authenticated successfully",
    });

    const activeSessionId = newSessionId || sessionId;
    response.cookies.set("JSESSIONID", activeSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600,
      path: "/api",
    });

    return response;
  } catch (err) {
    console.error("Login proxy error:", err);
    return NextResponse.json(
      { error: "Upstream login failed" },
      { status: 502 }
    );
  }
};