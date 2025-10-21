import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const responses = await prisma.response.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: responses });
    } catch (error) {
        console.error("Error fetching responses:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch responses" },
            { status: 500 }
        );
    }
}