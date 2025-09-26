import { NextRequest, NextResponse } from "next/server";
interface ApiUser {
  current_turn?: number;
  [key: string]: unknown;
}
interface ResponseData {
  status: string;
  user_id: string;
  uid: string;
  user_data: ApiUser | null;
  prize?: string; // optional

  [key: string]: unknown; // thêm dòng này
}

/// Giải Đặc Biệt
const specialPrizeUID: string[] = [
  "5550000001",
  "5550000002",
  "5550000003",
  "5550000004",
  "5550000005",
];

// Giải Nhất
const firstPrizeUID: string[] = [
  "5551000001",
  "5551000002",
  "5551000003",
  "5551000004",
  "5551000005",
];

// Giải Nhì
const secondPrizeList: string[] = [
  "5552000001",
  "5552000002",
  "5552000003",
  "5552000004",
  "5552000005",
];

// Giải Ba
const thirdPrizeList: string[] = [
  "5553000001",
  "5553000002",
  "5553000003",
  "5553000004",
  "5553000005",
];

// Không trúng
const loseList: string[] = [
  "5554000001",
  "5554000002",
  "5554000003",
  "5554000004",
  "5554000005",
];

function corsResponse(
  data: Record<string, unknown>,
  status = 200
): NextResponse {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return corsResponse({}, 200);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTotal = Date.now();
  try {
    const body: {
      campaign_id?: string;
      user_id?: string;
      uid?: string | number | null;
    } = await req.json();
    const { campaign_id, user_id, uid } = body;

    if (!campaign_id) {
      return corsResponse(
        { status: "error", message: "Thiếu campaign_id hoặc user_id" },
        400
      );
    }

    const uidStr = uid ? String(uid).trim().toUpperCase() : "";

    console.log(
      `[${new Date().toISOString()}] Start POST route, uid=${uidStr}`
    );

    // 1️⃣ Call API ngoài
    let apiUserData: ApiUser | null = null;

    try {
      const apiRes = await fetch(
        "https://api-gamification.merchant.vn/v1/gamification/user/gamification_user",
        {
          method: "POST",
          headers: {
            Accept: "application/json, text/javascript, */*; q=0.01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "get_info",
            campaign_id: campaign_id,
            user_id: user_id,
            uid: uidStr,
          }),
        }
      );

      const json = await apiRes.json();
      apiUserData = json?.data?.user || null;
    } catch (e) {
      console.error("Call API ngoài lỗi:", e);
    }

    // 2️⃣ Tính prize
    const startPrizeCalc = Date.now();
    let prizeName = "Không trúng";
    if (specialPrizeUID.includes(uidStr)) prizeName = "Giải Đặc Biệt";
    else if (firstPrizeUID.includes(uidStr)) prizeName = "Giải Nhất";
    else if (secondPrizeList.includes(uidStr)) prizeName = "Giải Nhì";
    else if (thirdPrizeList.includes(uidStr)) prizeName = "Giải Ba";
    else if (loseList.includes(uidStr)) prizeName = "Không trúng";

    // 3️⃣ Trả kết quả cuối cho FE
    const response: ResponseData = {
      status: "ok",
      user_id: user_id.trim(),
      uid: uidStr,
      user_data: apiUserData, // thêm data từ API ngoài
    };

    if (apiUserData.current_turn !== 1) {
      response.prize = prizeName;
    }
    console.log(
      `[${new Date().toISOString()}] Total POST processing time: ${
        Date.now() - startTotal
      }ms`
    );
    return corsResponse(response);
  } catch (err) {
    return corsResponse(
      {
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      500
    );
  }
}
