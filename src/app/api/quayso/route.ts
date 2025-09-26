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
const specialPrizeUID: string[] = [
  "9999000001",
  "9999000002",
  "9999000003",
  "9999000004",
  "9999000005",
  "9999000006",
  "9999000007",
  "9999000008",
  "9999000009",
  "9999000010",
];

const firstPrizeUID: string[] = [
  "9999100001",
  "9999100002",
  "9999100003",
  "9999100004",
  "9999100005",
  "9999100006",
  "9999100007",
  "9999100008",
  "9999100009",
  "9999100010",
];
const secondPrizeList: string[] = [
  "9999200001",
  "9999200002",
  "9999200003",
  "9999200004",
  "9999200005",
  "9999200006",
  "9999200007",
  "9999200008",
  "9999200009",
  "9999200010",
];
const thirdPrizeList: string[] = [
  "9999300001",
  "9999300002",
  "9999300003",
  "9999300004",
  "9999300005",
  "9999300006",
  "9999300007",
  "9999300008",
  "9999300009",
  "9999300010",
];
const loseList: string[] = [
  "9999400001",
  "9999400002",
  "9999400003",
  "9999400004",
  "9999400005",
  "9999400006",
  "9999400007",
  "9999400008",
  "9999400009",
  "9999400010",
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
