import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "../captcha/route";
import { ApiSuccessResponse } from "@/types/ApiResponse";

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

    const payload: ApiSuccessResponse<{ message: string }> = {
      success: true,
      data: { message: "Logged out successfully" },
    };

    const response = NextResponse.json(payload);
    response.cookies.set("JSESSIONID", "", { maxAge: 0, path: "/api" });
    response.cookies.set("auth_session", "", { maxAge: 0, path: "/" });

    return response;
  } catch (err) {
    console.error("Logout route error:", err);

    const payload: ApiSuccessResponse<{ message: string }> = {
      success: true,
      data: { message: "Session cleared locally" },
    };

    const response = NextResponse.json(payload, { status: 200 });
    response.cookies.set("JSESSIONID", "", { maxAge: 0, path: "/api" });
    response.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
    return response;
  }
};