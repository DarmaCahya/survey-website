import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config/config";
import toast from "react-hot-toast";
import { refreshToken } from "@/services/AuthService";

const api = axios.create({
    baseURL: config.apiBaseUrl,
    withCredentials: true,
});

api.interceptors.request.use( 
    (config) => {
        const token = Cookies.get("accessToken");
        config.headers = config.headers || {}; 
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
    
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
          
            try {
                await refreshToken();
            
                const newToken = Cookies.get("accessToken");
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
            
                return api(originalRequest);
            } catch (err) {
                Cookies.remove("accessToken");
                Cookies.remove("refreshToken");
                Cookies.remove("userId");

                toast.error("Session expired, please login again.");
                window.location.href = "/auth/login";
                return Promise.reject(err);
            }
        }          
        return Promise.reject(error);
    }
);
export default api;