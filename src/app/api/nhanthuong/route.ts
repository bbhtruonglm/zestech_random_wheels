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

// Giải Đặc Biệt
const specialPrizeUID: string[] = [
  "7770000001",
  "7770000002",
  "7770000003",
  "7770000004",
  "7770000005",
  "7770000006",
  "7770000007",
  "7770000008",
  "7770000009",
  "7770000010",
];

// Giải Nhất
const firstPrizeUID: string[] = [
  "7771000001",
  "7771000002",
  "7771000003",
  "7771000004",
  "7771000005",
  "7771000006",
  "7771000007",
  "7771000008",
  "7771000009",
  "7771000010",
];

// Giải Nhì
const secondPrizeList: string[] = [
  "7772000001",
  "7772000002",
  "7772000003",
  "7772000004",
  "7772000005",
  "7772000006",
  "7772000007",
  "7772000008",
  "7772000009",
  "7772000010",
];

// Giải Ba
const thirdPrizeList: string[] = [
  "7773000001",
  "7773000002",
  "7773000003",
  "7773000004",
  "7773000005",
  "7773000006",
  "7773000007",
  "7773000008",
  "7773000009",
  "7773000010",
];

// Không trúng
const loseList: string[] = [
  "7774000001",
  "7774000002",
  "7774000003",
  "7774000004",
  "7774000005",
  "7774000006",
  "7774000007",
  "7774000008",
  "7774000009",
  "7774000010",
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
