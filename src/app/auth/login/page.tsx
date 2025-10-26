'use client';

import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "@/validations/auth/schema";
import { LoginRequest } from "@/types/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/auth/useLogin";

export default function Login() {
    const { 
        register, 
        handleSubmit, 
        formState: { errors } } = useForm<LoginRequest>({
        resolver: yupResolver(loginSchema),
    });

    const { mutate, isPending } = useLogin();
    const onSubmit = (data: LoginRequest) => mutate(data);
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="w-full max-w-3xl flex flex-col items-center justify-center p-4 lg:p-14 gap-8">
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
                        <Input
                            type="password"
                            id="password"
                            {...register("password")}
                            placeholder="Enter your password"
                            className="py-6 placeholder:text-[#616161]"
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                    </div>
                    <div className="flex items-center justify-end">
                        <Link href="/auth/forgot-password" className="text-base font-semibold text-[#1E1E1E] hover:underline">
                            Lupa Kata Sandi
                        </Link>
                    </div>
                    <Button 
                        variant="secondary"   
                        size="lg"   
                        type="submit"
                        disabled={isPending}          
                        className="bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 transition-all duration-300 text-base md:text-xl p-2 text-white"
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