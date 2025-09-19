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

// Config mock
const specialPrizeUID: string[] = ["TEST123", "TEST1234", "TEST1235"]; // Giải Đặc Biệt
const firstPrizeUID: string[] = ["TEST234", "TEST235", "TEST236"]; // Giải Nhất
const secondPrizeList: string[] = ["TEST222"]; // Giải Nhì
const thirdPrizeList: string[] = [
  "TEST567",
  "TEST568",
  "TEST569",
  "TEST570",
  "TEST571",
  "TEST572",
  "TEST573",
  "TEST574",
  "TEST575",
  "TEST576",
  "TEST577",
  "TEST578",
  "TEST579",
]; // Giải Ba
const loseList: string[] = [
  "TEST999",
  "TEST998",
  "TEST997",
  "TEST996",
  "TEST995",
  "TEST994",
  "TEST993",
]; // Không trúng

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

    // 1️⃣ Call API core trước
    const url = new URL(
      "https://api-gamification.merchant.vn/v1/gamification/oncetask/play"
    );
    url.searchParams.set("campaign_id", campaign_id);
    url.searchParams.set("user_id", user_id);
    url.searchParams.set("uid", uid ? String(uid) : "");

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

    const uidStr = uid ? String(uid) : "";

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
      user_id,
      uid,
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
