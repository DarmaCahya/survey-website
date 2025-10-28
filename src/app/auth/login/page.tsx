'use client';

import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "@/validations/auth/schema";
import { LoginRequest } from "@/types/auth";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/auth/useLogin";
import { Spinner } from "@/components/ui/spinner";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { 
        register, 
        handleSubmit, 
        formState: { errors } } = useForm<LoginRequest>({
        resolver: yupResolver(loginSchema),
    });

    const { mutate, isPending } = useLogin();
    const onSubmit = (data: LoginRequest) => mutate(data);
    
    return (
        <div className="relative flex min-h-screen items-center justify-center">
            {isPending && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-4">
                        <Spinner className="w-10 h-10 text-purple-600 animate-spin" />
                        <p className="text-gray-700 font-medium">Memproses login...</p>
                    </div>
                </div>
            )}
            <div className="w-full max-w-3xl flex flex-col items-center justify-center p-4 lg:p-14 gap-8 shadow-2xl rounded-2xl bg-white">
                <div className="text-center space-y-5 text-[#212121]">
                    <h1 className="text-4xl font-bold">Masuk Ke Akun Anda</h1>
                    <p className="w-full text-lg max-w-xl">
                        Akses kuesioner untuk membantu kami memetakan tingkat kesadaran dan kesiapan Anda dalam melindungi data bisnis dari ancaman siber.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full gap-2 px-6">
                    <div className="flex flex-col gap-2">
                        <Label
                            htmlFor="email"
                            className="text-base font-semibold text-[#212121]"
                        >
                            Email
                        </Label>
                        <Input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            {...register("email")}
                            className="py-6 placeholder:text-[#616161]"
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label
                            htmlFor="password"
                            className="text-base font-semibold text-[#212121]"
                        >
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                {...register("password")}
                                placeholder="Enter your password"
                                className="py-6 placeholder:text-[#616161] pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                    </div>
                    {/* <div className="flex items-center justify-end">
                        <Link href="/auth/forgot-password" className="text-base font-semibold text-[#1E1E1E] hover:underline">
                            Lupa Kata Sandi
                        </Link>
                    </div> */}
                    <Button 
                        variant="secondary"   
                        size="lg"   
                        type="submit"
                        disabled={isPending}          
                        className="bg-linear-to-r mb-2 mt-4 from-purple-600 to-purple-400 hover:opacity-90 transition-all duration-300 text-base md:text-xl p-2 text-white"
                    >
                        {isPending ? "Loading..." : "Login"}
                    </Button>
                    <p className="text-center text-gray-800 text-base">
                        Belum memiliki akun?{" "}
                        <Link href="/auth/register" className="text-black font-medium hover:underline">
                            Daftar sekarang
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}