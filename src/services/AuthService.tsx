import api from "@/lib/api";
import Cookies from "js-cookie";
import { safeRequest } from "@/app/utils/safeRequest";

export const register = async (name: string, email: string, password: string) => {
    return safeRequest(async () => {
        const response = await api.post("/api/auth/register", { name, email, password });
        return response.data;
    });
};

export const login = async (email: string, password: string) => {
    return safeRequest(async () => {
        const response = await api.post("/api/auth/login", { email, password });
        const { accessToken, refreshToken } = response.data.data;

        Cookies.set("accessToken", accessToken, {
            expires: 7,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        });

        Cookies.set("refreshToken", refreshToken, {
            expires: 30,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        });

        return response.data;
    });
};

export const refreshToken = async () => {
    return safeRequest(async () => {
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) throw new Error("Refresh token not found");

        const response = await api.post("/api/auth/refresh", { refreshToken });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        response.data.data;

        Cookies.set("accessToken", newAccessToken, {
            expires: 7,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        });

        Cookies.set("refreshToken", newRefreshToken, {
            expires: 30,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        });

        return response.data;
    });
};

export const logout = async () => {
    return safeRequest(async () => {
        try {
            await api.get("/auth/logout");
        } finally {
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
            Cookies.remove("userId");
            window.location.href = "/auth/login";
        }
    });
};

export const getResponses = async () => {
    return safeRequest(async () => {
        const response = await api.get("/responses");
        return response.data;
    });
};