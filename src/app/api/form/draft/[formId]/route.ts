import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database"; // Pastikan path ini sesuai dengan lokasi database kamu

// Handler untuk POST (simpan atau update draft survey)
export async function POST(req: NextRequest, { params }: { params: { formId: string } }) {
  try {
    // Ambil formId dari params dan userId serta data lainnya dari request body
    const { formId } = params;
    const { userId, answers, currentIndex } = await req.json();

    // Pastikan userId ada, answers ada, dan currentIndex adalah angka
    if (!userId || !answers || typeof currentIndex !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Konversi userId ke Number agar sesuai dengan tipe data di database
    const userIdAsNumber = Number(userId);
    if (isNaN(userIdAsNumber)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Gunakan upsert untuk menyimpan atau memperbarui draft survey
    const draft = await db.draftSurvey.upsert({
      where: {
        userId_formId: { userId: userIdAsNumber, formId: Number(formId) },
      },
      update: { answers, currentIndex },
      create: { userId: userIdAsNumber, formId: Number(formId), answers, currentIndex },
    });

    return NextResponse.json({ success: true, draft });
  } catch (err) {
    console.error("POST /api/drafts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Handler untuk GET (ambil draft survey)
export async function GET(req: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const { formId } = params;
    // Ambil userId dari header dan konversi ke Number
    const userId = Number(req.headers.get("x-user-id"));
    
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Ambil draft survey berdasarkan formId dan userId
    const draft = await db.draftSurvey.findUnique({
      where: { userId_formId: { userId, formId: Number(formId) } },
    });

    return NextResponse.json({ draft: draft || null });
  } catch (err) {
    console.error("GET /api/drafts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Handler untuk DELETE (hapus draft survey)
export async function DELETE(req: NextRequest, { params }: { params: { formId: string } }) {
  try {
    const { formId } = params;
    // Ambil userId dari header dan konversi ke Number
    const userId = Number(req.headers.get("x-user-id"));
    
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Hapus semua draft survey berdasarkan userId dan formId
    await db.draftSurvey.deleteMany({
      where: { userId, formId: Number(formId) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/drafts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
