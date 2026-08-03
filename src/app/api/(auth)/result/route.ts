import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "../captcha/route";

export const GET = async (req: NextRequest) => {
  try {
    const sessionId = req.cookies.get("JSESSIONID")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in.", expired: true },
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
      if (
        res.status === 401 ||
        raw.toLowerCase().includes("login") ||
        raw.toLowerCase().includes("no session")
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

      return NextResponse.json(
        { error: "Invalid response from upstream", preview: raw.slice(0, 500) },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Results route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch results from GGSIPU server" },
      { status: 502 }
    );
  }
};