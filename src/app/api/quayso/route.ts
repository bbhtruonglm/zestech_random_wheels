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

// Config mock 2
const specialPrizeUID: string[] = ["VIP001", "VIP002", "VIP003"]; // Giải Đặc Biệt
const firstPrizeUID: string[] = ["FST101", "FST102", "FST103"]; // Giải Nhất
const secondPrizeList: string[] = [
  "SEC201",
  "SEC202",
  "SEC203",
  "SEC204",
  "SEC205",
  "SEC206",
  "SEC207",
  "SEC208",
]; // Giải Nhì
const thirdPrizeList: string[] = [
  "THD301",
  "THD302",
  "THD303",
  "THD304",
  "THD305",
  "THD306",
  "THD307",
  "THD308",
  "THD309",
  "THD310",
  "THD311",
  "THD312",
  "THD313",
]; // Giải Ba
const loseList: string[] = [
  "LOS401",
  "LOS402",
  "LOS403",
  "LOS404",
  "LOS405",
  "LOS406",
  "LOS407",
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
