import { NextRequest, NextResponse } from "next/server";

// Định nghĩa interface cho dữ liệu trả về từ API core
interface CoreData {
  data?: {
    current_turn?: number;
    index?: number;
    user_id?: string;
    index_my_gift?: number;
    voucher_code?: string;
  };
  code?: number;
  error_message?: string;
}

// Giải Đặc Biệt
const specialPrizeUID: string[] = ["9990000001", "9990000002", "9990000003"];

// Giải Nhất
const firstPrizeUID: string[] = ["9991000001", "9991000002", "9991000003"];

// Giải Nhì
const secondPrizeList: string[] = [
  "9992000001",
  "9992000002",
  "9992000003",
  "9992000004",
  "9992000005",
  "9992000006",
  "9992000007",
  "9992000008",
];

// Giải Ba
const thirdPrizeList: string[] = [
  "9993000001",
  "9993000002",
  "9993000003",
  "9993000004",
  "9993000005",
  "9993000006",
  "9993000007",
  "9993000008",
  "9993000009",
  "9993000010",
  "9993000011",
  "9993000012",
  "9993000013",
];

// Không trúng
const loseList: string[] = [
  "9994000001",
  "9994000002",
  "9994000003",
  "9994000004",
  "9994000005",
  "9994000006",
  "9994000007",
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
  try {
    const body: {
      campaign_id?: string;
      user_id?: string;
      uid?: string | number | null;
    } = await req.json();

    const { campaign_id, user_id, uid } = body;

    if (!campaign_id || !user_id) {
      return corsResponse(
        { status: "error", message: "Thiếu campaign_id hoặc user_id" },
        400
      );
    }

    // chuẩn hóa uid: trim + uppercase
    const uidStr = uid ? String(uid).trim().toUpperCase() : "";

    // 1️⃣ Call API core trước
    const url = new URL(
      "https://api-gamification.merchant.vn/v1/gamification/oncetask/play"
    );
    url.searchParams.set("campaign_id", campaign_id.trim());
    url.searchParams.set("user_id", user_id.trim());
    url.searchParams.set("uid", uidStr);

    const coreRes = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const coreData: CoreData = await coreRes.json();

    // 2️⃣ Nếu core có error_message
    if (
      coreData?.error_message &&
      coreData.error_message !== "Bạn đã hết lượt chơi"
    ) {
      // lỗi khác -> return nguyên lỗi
      return corsResponse(
        {
          status: "error",
          message: coreData.error_message,
          code: coreData.code ?? 400,
        },
        400
      );
    }

    // 3️⃣ Tính toán mock hoặc core prize
    let prizeName: string;

    if (specialPrizeUID.includes(uidStr)) {
      prizeName = "Giải Đặc Biệt";
    } else if (firstPrizeUID.includes(uidStr)) {
      prizeName = "Giải Nhất";
    } else if (secondPrizeList.includes(uidStr)) {
      prizeName = "Giải Nhì";
    } else if (thirdPrizeList.includes(uidStr)) {
      prizeName = "Giải Ba";
    } else if (loseList.includes(uidStr)) {
      prizeName = "Không trúng";
    } else {
      prizeName = "Không trúng";
    }

    // 4️⃣ Trả kết quả về client
    return corsResponse({
      status: "ok",
      user_id: user_id.trim(),
      uid: uidStr,
      data: coreData,
      prize: prizeName,
      code: coreData.code,
      error_message: coreData.error_message ?? null, // vẫn trả error_message nếu có
    });
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
