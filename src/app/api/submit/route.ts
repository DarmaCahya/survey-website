import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, ...answers } = body;

        const newResponse = await prisma.response.create({
            data: { name, email, answers },
        });

        return NextResponse.json({ success: true, data: newResponse });
    } catch (error) {
        console.error("Error submitting response:", error);
        return NextResponse.json({ success: false, error: "Failed to submit data" }, { status: 500 });
    }
}
