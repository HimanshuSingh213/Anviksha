import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "../captcha/route";

export const POST = async (req: NextRequest) => {
  try {
    const sessionId = req.cookies.get("JSESSIONID")?.value;

    if (sessionId) {
      await axios.get(`${BASE_URL}/web/logout`, {
        headers: {
          Cookie: `JSESSIONID=${sessionId}`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: `${BASE_URL}/web/student/studenthome.jsp`,
        },
        validateStatus: () => true,
      });
    }

    // Clear session cookie from browser
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set("JSESSIONID", "", {
      maxAge: 0,
      path: "/api",
    });

    return response;
  } catch (err) {
    console.error("Logout route error:", err);
    // Still clear the cookie even if upstream failed
    const response = NextResponse.json(
      { success: true, message: "Session cleared locally" },
      { status: 200 }
    );
    response.cookies.set("JSESSIONID", "", {
      maxAge: 0,
      path: "/api",
    });
    return response;
  }
};