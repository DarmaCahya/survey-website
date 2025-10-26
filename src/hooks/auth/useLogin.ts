import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { login } from "@/services/AuthService";
import { LoginRequest } from "@/types/auth";
import { useRouter } from "next/navigation";

export const useLogin = () => {
    const router = useRouter();
    return useMutation({
        mutationFn: (data: LoginRequest) => login(data.email, data.password),
        onSuccess: (res) => {
            toast.success("Login berhasil!");
            router.push("/dashboard");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Login gagal");
        },
    });
};