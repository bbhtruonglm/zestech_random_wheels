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
  prize?: string;
  [key: string]: unknown;
}

const specialPrizeUID: string[] = ["0842501179"];

const firstPrizeUID: string[] = ["1631899306"];
const secondPrizeList: string[] = [""];
const thirdPrizeList: string[] = ["7663376223"];

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
        { status: "error", message: "Thiếu campaign_id" },
        400
      );
    }

    const uidStr = uid ? String(uid).trim().toUpperCase() : "";
    console.log(
      `[${new Date().toISOString()}] Start POST route, uid=${uidStr}`
    );

    // 1️⃣ Gọi API ngoài để lấy user info
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
            campaign_id,
            user_id,
            uid: uidStr,
          }),
        }
      );

      const json = await apiRes.json();
      apiUserData = json?.data?.user || null;
    } catch (e) {
      console.error("Call API ngoài lỗi:", e);
    }

    // 2️⃣ Gọi thêm API kiểm tra mã code thật
    let availableCodes: string[] = [];
    try {
      const checkRes = await fetch(
        "https://inv-zestech.id.vn/external/lottery/current-codes",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer sk_lottery_7f9a2b4e6d1c8f3a5e9b2d4c6a8f1e3b",
          },
        }
      );

      const checkJson = await checkRes.json();
      if (checkJson?.success && Array.isArray(checkJson.data)) {
        availableCodes = checkJson.data
          .map((item: any) =>
            item.lottery_code?.toString().trim().toUpperCase()
          )
          .filter(Boolean);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API kiểm tra code thật:", err);
    }

    // ✅ Nếu code không nằm trong danh sách -> trả về lỗi
    if (!availableCodes.includes(uidStr)) {
      return corsResponse({ status: "error", message: "Mã không hợp lệ" }, 400);
    }

    // 3️⃣ Tính giải thưởng
    let prizeName = "Không trúng";
    if (specialPrizeUID.includes(uidStr)) prizeName = "Giải Đặc Biệt";
    else if (firstPrizeUID.includes(uidStr)) prizeName = "Giải Nhất";
    else if (secondPrizeList.includes(uidStr)) prizeName = "Giải Nhì";
    else if (thirdPrizeList.includes(uidStr)) prizeName = "Giải Ba";

    // 4️⃣ Trả kết quả cuối
    const response: ResponseData = {
      status: "ok",
      user_id: user_id.trim(),
      uid: uidStr,
      user_data: apiUserData,
    };

    if (apiUserData?.current_turn !== 1) {
      response.prize = prizeName;
    }

    console.log(
      `[${new Date().toISOString()}] Total POST processing time: ${
        Date.now() - startTotal
      }ms`
    );

    return corsResponse(response);
  } catch (err) {
    console.error("Lỗi tổng:", err);
    return corsResponse(
      {
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      500
    );
  }
}
