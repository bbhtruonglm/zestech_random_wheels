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
const specialPrizeUID = [
  123, 1231, 1232, 1233, 1234, 1235, 1236, 1237, 1238, 1239,
]; // Giải Đặc Biệt
const firstPrizeUID = [
  234, 2341, 2342, 2343, 2344, 2345, 2346, 2347, 2348, 2349,
]; // Giải Nhì
const secondPrizeList = [
  111, 222, 333, 3331, 3332, 3333, 3334, 3335, 3336, 3337, 3338, 3339,
]; // Giải 3
const thirdPrizeList = [
  567, 568, 569, 570, 571, 572, 573, 574, 575, 576, 577, 578, 579,
]; // Giải 4
const loseList = [
  666, 777, 888, 999, 9991, 9992, 9993, 9994, 9995, 9996, 9997, 9998,
]; // Không trúng

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

    if (specialPrizeUID.includes(uidNum)) {
      prizeName = "Giải Đặc Biệt";
    } else if (firstPrizeUID.includes(uidNum)) {
      prizeName = "Giải Nhất";
    } else if (secondPrizeList.includes(uidNum)) {
      prizeName = "Giải Nhì";
    } else if (thirdPrizeList.includes(uidNum)) {
      prizeName = "Giải Ba";
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
