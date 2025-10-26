import axios from "axios";
import config from "@/config/config";

export const pinApi = axios.create({
    baseURL: config.apiBaseUrl,
});

export const getAnalyticDataByPin = async (adminPin: string) => {
    if (!adminPin) throw new Error("PIN admin belum diatur");

    const res = await pinApi.get("form/admin/analytics", {
        headers: {
            "x-admin-pin": adminPin,
        },
    });

    if (!res.data.success) {
        throw new Error(res.data.message || "Gagal mengambil data analytics");
    }

    return res.data;
};
