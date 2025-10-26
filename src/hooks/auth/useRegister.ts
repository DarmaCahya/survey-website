import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { register as registerService } from "@/services/AuthService";
import { RegisterRequest } from "@/types/auth";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

export const useRegister = (resetForm?: () => void) => {
    const router = useRouter();
    return useMutation({
        mutationFn: (data: RegisterRequest) => registerService( data.name, data.email, data.password),
        onSuccess: () => {
            toast.success("Register berhasil!");
            if (resetForm) resetForm();
            router.push("/auth/login");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Register gagal");
        }
    });
};