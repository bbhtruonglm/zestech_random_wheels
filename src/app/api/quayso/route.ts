// app/api/quayso/route.ts
import { NextRequest, NextResponse } from "next/server";

// Danh sách UID giả định
const specialPrizeUID = 123; // Giải Đặc Biệt
const secondPrizeUID = 234; // Giải Nhì

// Danh sách UID giải 3 & giải 4
const thirdPrizeList = [111, 222, 333]; // Giải 3
const fourthPrizeList = [444, 555, 556]; // Giải 4

// Danh sách UID không trúng
const loseList = [666, 777, 888, 999];

function corsResponse(data: any, status = 200) {
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
  // Preflight request
  return corsResponse({}, 200);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, uid } = body;

  if (!user_id || !uid) {
    return corsResponse(
      { status: "error", message: "Thiếu user_id hoặc uid" },
      400
    );
  }

  const uidNum = Number(uid);

  // Giải đặc biệt
  if (uidNum === specialPrizeUID) {
    return corsResponse({ status: "ok", prize: "Giải Đặc Biệt", user_id, uid });
  }

  // Giải nhì
  if (uidNum === secondPrizeUID) {
    return corsResponse({ status: "ok", prize: "Giải Nhì", user_id, uid });
  }

  // Giải 3
  if (thirdPrizeList.includes(uidNum)) {
    return corsResponse({ status: "ok", prize: "Giải 3", user_id, uid });
  }

  // Giải 4
  if (fourthPrizeList.includes(uidNum)) {
    return corsResponse({ status: "ok", prize: "Giải 4", user_id, uid });
  }

  // Không trúng
  if (loseList.includes(uidNum)) {
    return corsResponse({ status: "ok", prize: "Không trúng", user_id, uid });
  }

  // Ngoài danh sách
  return corsResponse(
    { status: "error", message: "Mã không đúng", user_id, uid },
    400
  );
}
