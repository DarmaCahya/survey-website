import Cookies from "js-cookie";
import { verifyUser } from "./AuthService";

export const fetchUser = async () => {
    const token = Cookies.get("accessToken");
    if (!token) throw new Error("No access token found");

    const response = await verifyUser(token);
    if (!response.success) throw new Error(response.message || "Failed to verify user");

    return response.data;
};
