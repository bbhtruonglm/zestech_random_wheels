import { NextRequest, NextResponse } from "next/server";

// Config mock
const specialPrizeUID = 123; // Giải Đặc Biệt
const secondPrizeUID = 234; // Giải Nhì

const thirdPrizeList = [111, 222, 333]; // Giải 3
const fourthPrizeList = [444, 555, 556]; // Giải 4
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
    const { campaign_id, user_id, uid } = await req.json();

    if (!campaign_id || !user_id) {
      return corsResponse(
        { status: "error", message: "Thiếu campaign_id hoặc user_id" },
        400
      );
    }

    const uidNum = Number(uid);

    // 1️⃣ Check mock trước
    if (uidNum === specialPrizeUID) {
      return corsResponse({
        status: "ok",
        prize: "Giải Đặc Biệt",
        user_id,
        uid,
      });
    }

    if (uidNum === secondPrizeUID) {
      return corsResponse({ status: "ok", prize: "Giải Nhì", user_id, uid });
    }

    if (thirdPrizeList.includes(uidNum)) {
      return corsResponse({ status: "ok", prize: "Giải 3", user_id, uid });
    }

    if (fourthPrizeList.includes(uidNum)) {
      return corsResponse({ status: "ok", prize: "Giải 4", user_id, uid });
    }

    if (loseList.includes(uidNum)) {
      return corsResponse({ status: "ok", prize: "Không trúng", user_id, uid });
    }

    // 2️⃣ Không có trong mock → call API core
    const url = new URL(
      "https://api-gamification.merchant.vn/v1/gamification/oncetask/play"
    );
    url.searchParams.set("campaign_id", campaign_id);
    url.searchParams.set("user_id", user_id);
    url.searchParams.set("uid", uid ?? "");

    const coreRes = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Nếu cần Authorization token thì thêm ở đây
      },
    });

    if (!coreRes.ok) {
      return corsResponse(
        { status: "error", message: "API core lỗi" },
        coreRes.status
      );
    }

    const coreData = await coreRes.json();

    // 3️⃣ Trả kết quả core (có thể transform)
    return corsResponse({
      status: "ok",
      source: "core", // để biết là từ core
      data: coreData.data,
      code: coreData.code,
    });
  } catch (err: unknown) {
    return corsResponse(
      { status: "error", message: (err as Error).message },
      500
    );
  }
}
