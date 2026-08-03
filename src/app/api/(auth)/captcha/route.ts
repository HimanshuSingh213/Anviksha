import axios from "axios";
import { NextResponse } from "next/server";

export const BASE_URL = "https://examweb.ggsipu.ac.in";

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
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      return NextResponse.json(
        { error: `GGSIPU server returned error status ${res.status}` },
        { status: res.status }
      );
    }

    const setCookie = res.headers["set-cookie"];
    let sessionId: string | null = null;

    if (setCookie) {
      const cookieStr = Array.isArray(setCookie) ? setCookie[0] : String(setCookie);
      const match = cookieStr?.match(/JSESSIONID=([^;]+)/);
      if (match) sessionId = match[1];
    }

    const imageBuffer = Buffer.from(res.data);
    const response = new NextResponse(imageBuffer, {
      headers: { "Content-Type": "image/png" },
    });

    if (sessionId) {
      response.cookies.set("JSESSIONID", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 300,
        path: "/api",
      });
    }

    return response;
  } catch (err) {
    console.error("CAPTCHA proxy error:", err);
    return NextResponse.json(
      { error: "Failed to fetch captcha from GGSIPU server" },
      { status: 500 }
    );
  }
};