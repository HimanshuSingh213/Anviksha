import { ApiSuccessResponse } from "@/types/ApiResponse";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    return NextResponse.json<ApiSuccessResponse>({
        success: true,
        data: {
            timestamp: Date.now(),
        }
    }, { status: 200});
}