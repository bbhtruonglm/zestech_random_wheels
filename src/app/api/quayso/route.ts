import { NextRequest, NextResponse } from "next/server";

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

    // if (!campaign_id || !user_id) {
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

    // 1️⃣ Call API core
    const startCoreCall = Date.now();
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
    console.log(
      `[${new Date().toISOString()}] API core fetched in ${
        Date.now() - startCoreCall
      }ms`
    );

    if (
      coreData?.error_message &&
      coreData.error_message !== "Bạn đã hết lượt chơi"
    ) {
      return corsResponse(
        {
          status: "error",
          message: coreData.error_message,
          code: coreData.code ?? 400,
        },
        400
      );
    }

    // 2️⃣ Tính prize
    const startPrizeCalc = Date.now();
    let prizeName = "Không trúng";
    if (specialPrizeUID.includes(uidStr)) prizeName = "Giải Đặc Biệt";
    else if (firstPrizeUID.includes(uidStr)) prizeName = "Giải Nhất";
    else if (secondPrizeList.includes(uidStr)) prizeName = "Giải Nhì";
    else if (thirdPrizeList.includes(uidStr)) prizeName = "Giải Ba";
    else if (loseList.includes(uidStr)) prizeName = "Không trúng";

    console.log(
      `[${new Date().toISOString()}] Prize calculated in ${
        Date.now() - startPrizeCalc
      }ms, prize=${prizeName}`
    );

    // 3️⃣ Trả kết quả cuối cho FE
    const response = {
      status: "ok",
      user_id: user_id.trim(),
      uid: uidStr,
      data: coreData,
      prize: prizeName,
      code: coreData.code,
      error_message: coreData.error_message ?? null,
      timings: {
        total: Date.now() - startTotal,
        coreCall: Date.now() - startCoreCall,
        prizeCalc: Date.now() - startPrizeCalc,
      },
    };

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
