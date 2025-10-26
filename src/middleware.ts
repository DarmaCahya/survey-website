import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard"];

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("accessToken")?.value;
    const path = req.nextUrl.pathname;
    const isProtected = protectedRoutes.some(route => path.startsWith(route));

    if (isProtected) {
        if (!token) {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                return NextResponse.redirect(new URL("/forbidden", req.url));
            }

            const data = await res.json();

            if (!data.valid && !data.success) {
                return NextResponse.redirect(new URL("/auth/login", req.url));
            }
        } catch (error) {
            console.error("Token verification failed:", error);
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};