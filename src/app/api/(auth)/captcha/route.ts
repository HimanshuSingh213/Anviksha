import axios, { AxiosError } from "axios";
import { NextResponse } from "next/server";

export const BASE_URL = "https://examweb.ggsipu.ac.in";
const REQUEST_TIMEOUT = 8000; // 8 seconds

export const GET = async () => {
  try {
    const timestamp = Date.now();
    const res = await axios.get(`${BASE_URL}/web/CaptchaServlet`, {
      params: { t: timestamp },
      responseType: "arraybuffer",
      headers: {
        Accept: "image/png,image/*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: REQUEST_TIMEOUT,
      validateStatus: () => true,
    });

    if (res.status >= 500) {
      return NextResponse.json({
        success: false,
        error: "GGSIPU server is experiencing issues. Please try again later.",
        code: "UPSTREAM_ERROR"
      }, { status: 502 })
    }

    if (res.status >= 400) {
      return NextResponse.json({
        success: false,
        error: "Failed to generate CAPTCHA. Please refresh.",
        code: "UPSTREAM_ERROR"
      }, { status: 502 })
    }

    const setCookie = res.headers["set-cookie"];
    let sessionId: string | null = null;

    if (setCookie) {
      const cookieStr = Array.isArray(setCookie) ? setCookie[0] : String(setCookie);
      const match = cookieStr?.match(/JSESSIONID=([^;]+)/);
      if (match) sessionId = match[1];
    }

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: "Session initialization failed. Please retry.",
        code: "UPSTREAM_ERROR"
      }, { status: 502 });
    }

    const imageBuffer = Buffer.from(res.data);
    const response = new NextResponse(imageBuffer, {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
    });

    response.cookies.set("JSESSIONID", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 300,
      path: "/api",
    });

    return response;
  } catch (err) {
    const axiosErr = err as AxiosError;

    if (axiosErr.code === "ECONNABORTED" || axiosErr.code === "ETIMEDOUT") {
      return NextResponse.json({
        success: false,
        error: "Request timed out. GGSIPU may be slow.",
        code: "NETWORK_ERROR"
      }, { status: 504 });
    }

    if (axiosErr.code === "ECONNREFUSED" || axiosErr.code === "ENOTFOUND") {
      return NextResponse.json({
        success: false,
        error: "Cannot reach GGSIPU servers. Check your connection.",
        code: "NETWORK_ERROR"
      }, { status: 503 });
    }

    console.error("CAPTCHA proxy error:", axiosErr.message);
    
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      code: "UNKNOWN"
    }, { status: 500 });
  }
};