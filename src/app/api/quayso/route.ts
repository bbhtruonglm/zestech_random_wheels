import { NextRequest, NextResponse } from "next/server";

// Định nghĩa interface cho dữ liệu trả về từ API core (optional)
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
const specialPrizeUID = 123; // Giải Đặc Biệt
const secondPrizeUID = 234; // Giải Nhì
const thirdPrizeList = [111, 222, 333]; // Giải 3
const fourthPrizeList = [444, 555, 556, 557, 558, 559, 560, 561, 562, 563, 564]; // Giải 4
const loseList = [666, 777, 888, 999]; // Không trúng

function corsResponse(data: Record<string, unknown>, status = 200) {
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

export async function OPTIONS() {
  return corsResponse({}, 200);
}

export async function POST(req: NextRequest) {
  try {
    const { campaign_id, user_id, uid } = (await req.json()) as {
      campaign_id?: string;
      user_id?: string;
      uid?: string | number | null;
    };

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

    const coreData = (await coreRes.json()) as CoreData;

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
    const uidNum = Number(uid);
    let prizeName: string;

    if (uidNum === specialPrizeUID) {
      prizeName = "Giải Đặc Biệt";
    } else if (uidNum === secondPrizeUID) {
      prizeName = "Giải Nhì";
    } else if (thirdPrizeList.includes(uidNum)) {
      prizeName = "Giải 3";
    } else if (fourthPrizeList.includes(uidNum)) {
      prizeName = "Giải 4";
    } else if (loseList.includes(uidNum)) {
      prizeName = "Không trúng";
    } else {
      //   // nếu không thuộc mock → dùng index_my_gift của core để suy ra tên giải
      //   const index = coreData?.data?.index_my_gift;
      //   switch (index) {
      //     case 1:
      //       prizeName = "Giải Đặc Biệt";
      //       break;
      //     case 2:
      //       prizeName = "Giải Nhì";
      //       break;
      //     case 3:
      //       prizeName = "Giải 3";
      //       break;
      //     case 4:
      //       prizeName = "Giải 4";
      //       break;
      //     default:
      //       prizeName = "Không trúng";
      //       break;
      //   }
      prizeName = "Không trúng";
    }

    // 4️⃣ Trả kết quả về client
    return corsResponse({
      status: "ok",
      user_id,
      uid,
      // coreData: coreData.data ?? null,
      ...coreData,
      prize: prizeName,
      code: coreData.code,
      // error_message: coreData.error_message ?? null, // vẫn trả error_message nếu có
      error_message: null, // vẫn trả error_message nếu có
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
