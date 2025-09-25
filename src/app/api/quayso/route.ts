// import { NextRequest, NextResponse } from "next/server";

// // Định nghĩa interface cho dữ liệu trả về từ API core
// interface CoreData {
//   data?: {
//     current_turn?: number;
//     index?: number;
//     user_id?: string;
//     index_my_gift?: number;
//     voucher_code?: string;
//   };
//   code?: number;
//   error_message?: string;
// }

// // Giải Đặc Biệt
// const specialPrizeUID: string[] = ["8880000001", "8880000002", "8880000003"];

// // Giải Nhất
// const firstPrizeUID: string[] = ["8881000001", "8881000002", "8881000003"];

// // Giải Nhì
// const secondPrizeList: string[] = [
//   "8882000001",
//   "8882000002",
//   "8882000003",
//   "8882000004",
//   "8882000005",
//   "8882000006",
//   "8882000007",
//   "8882000008",
// ];

// // Giải Ba
// const thirdPrizeList: string[] = [
//   "8883000001",
//   "8883000002",
//   "8883000003",
//   "8883000004",
//   "8883000005",
//   "8883000006",
//   "8883000007",
//   "8883000008",
//   "8883000009",
//   "8883000010",
//   "8883000011",
//   "8883000012",
//   "8883000013",
// ];

// // Không trúng
// const loseList: string[] = [
//   "8884000001",
//   "8884000002",
//   "8884000003",
//   "8884000004",
//   "8884000005",
//   "8884000006",
//   "8884000007",
// ];

// function corsResponse(
//   data: Record<string, unknown>,
//   status = 200
// ): NextResponse {
//   return new NextResponse(JSON.stringify(data), {
//     status,
//     headers: {
//       "Content-Type": "application/json",
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     },
//   });
// }

// export async function OPTIONS(): Promise<NextResponse> {
//   return corsResponse({}, 200);
// }

// export async function POST(req: NextRequest): Promise<NextResponse> {
//   try {
//     const body: {
//       campaign_id?: string;
//       user_id?: string;
//       uid?: string | number | null;
//     } = await req.json();

//     const { campaign_id, user_id, uid } = body;

//     if (!campaign_id || !user_id) {
//       return corsResponse(
//         { status: "error", message: "Thiếu campaign_id hoặc user_id" },
//         400
//       );
//     }

//     // chuẩn hóa uid: trim + uppercase
//     const uidStr = uid ? String(uid).trim().toUpperCase() : "";

//     // 1️⃣ Call API core trước
//     const url = new URL(
//       "https://api-gamification.merchant.vn/v1/gamification/oncetask/play"
//     );
//     url.searchParams.set("campaign_id", campaign_id.trim());
//     url.searchParams.set("user_id", user_id.trim());
//     url.searchParams.set("uid", uidStr);

//     const coreRes = await fetch(url.toString(), {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     });

//     const coreData: CoreData = await coreRes.json();

//     // 2️⃣ Nếu core có error_message
//     if (
//       coreData?.error_message &&
//       coreData.error_message !== "Bạn đã hết lượt chơi"
//     ) {
//       // lỗi khác -> return nguyên lỗi
//       return corsResponse(
//         {
//           status: "error",
//           message: coreData.error_message,
//           code: coreData.code ?? 400,
//         },
//         400
//       );
//     }

//     // 3️⃣ Tính toán mock hoặc core prize
//     let prizeName: string;

//     if (specialPrizeUID.includes(uidStr)) {
//       prizeName = "Giải Đặc Biệt";
//     } else if (firstPrizeUID.includes(uidStr)) {
//       prizeName = "Giải Nhất";
//     } else if (secondPrizeList.includes(uidStr)) {
//       prizeName = "Giải Nhì";
//     } else if (thirdPrizeList.includes(uidStr)) {
//       prizeName = "Giải Ba";
//     } else if (loseList.includes(uidStr)) {
//       prizeName = "Không trúng";
//     } else {
//       prizeName = "Không trúng";
//     }

//     // 4️⃣ Trả kết quả về client
//     return corsResponse({
//       status: "ok",
//       user_id: user_id.trim(),
//       uid: uidStr,
//       data: coreData,
//       prize: prizeName,
//       code: coreData.code,
//       error_message: coreData.error_message ?? null, // vẫn trả error_message nếu có
//     });
//   } catch (err) {
//     return corsResponse(
//       {
//         status: "error",
//         message: err instanceof Error ? err.message : "Unknown error",
//       },
//       500
//     );
//   }
// }

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

    if (!campaign_id || !user_id) {
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
