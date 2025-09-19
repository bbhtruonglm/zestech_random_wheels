// app/api/quayso/route.ts
import { NextRequest, NextResponse } from "next/server";

// List giả định
const winList = [111, 222, 333, 444, 555]; // List ngẫu nhiên trúng giải 3/4
const loseList = [666, 777, 888, 999]; // List ngẫu nhiên không trúng

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, uid } = body;

  if (!user_id || !uid) {
    return NextResponse.json(
      { status: "error", message: "Thiếu user_id hoặc uid" },
      { status: 400 }
    );
  }

  // ép kiểu uid thành số (nếu cần)
  const uidNum = Number(uid);

  // Check giải đặc biệt
  if (uidNum === 123) {
    return NextResponse.json({
      status: "ok",
      prize: "Giải Đặc Biệt",
      user_id,
      uid,
    });
  }

  // Check giải nhì
  if (uidNum === 234) {
    return NextResponse.json({
      status: "ok",
      prize: "Giải Nhì",
      user_id,
      uid,
    });
  }

  // Check list trúng giải 3/4
  if (winList.includes(uidNum)) {
    // Random giải 3 hoặc 4
    const prize = Math.random() > 0.5 ? "Giải 3" : "Giải 4";
    return NextResponse.json({
      status: "ok",
      prize,
      user_id,
      uid,
    });
  }

  // Check list không trúng
  if (loseList.includes(uidNum)) {
    return NextResponse.json({
      status: "ok",
      prize: "Không trúng",
      user_id,
      uid,
    });
  }

  // Ngoài danh sách → mã không đúng
  return NextResponse.json(
    {
      status: "error",
      message: "Mã không đúng",
      user_id,
      uid,
    },
    { status: 400 }
  );
}
