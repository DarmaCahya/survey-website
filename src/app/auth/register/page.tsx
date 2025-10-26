'use client';

import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InferType } from "yup";

import { registerSchema } from "@/validations/auth/schema";
import { useRegister } from "@/hooks/auth/useRegister";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterFormData = InferType<typeof registerSchema>;

export default function Register() {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: yupResolver(registerSchema),
    });

    const { mutate, isPending } = useRegister(() => reset());

    const onSubmit = (data: RegisterFormData) => {
        const { confirmPassword, ...payload } = data; 
        mutate(payload);
    }
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="w-full max-w-3xl flex flex-col items-center justify-center p-4 lg:p-14 gap-8">
                <div className="text-center space-y-5 text-[#212121]">
                    <h1 className="text-4xl font-bold">Daftarkan Akun</h1>
                    <p className="w-full text-lg max-w-xl">
                        Akses kuesioner untuk membantu kami memetakan tingkat kesadaran dan kesiapan Anda dalam melindungi data bisnis dari ancaman siber.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full gap-2 px-6">
                    <div className="flex flex-col gap-2">
                        <Label
                            htmlFor="name"
                            className="text-base font-semibold text-[#212121]"
                        >
                            Username
                        </Label>
                        <Input
                            type="text"
                            id="name"
                            {...register("name")}
                            placeholder="Enter your username"
                            className="py-6 placeholder:text-[#616161]"
                        />
                        {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
                    </div>
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
                            {...register("email")}
                            placeholder="Enter your email"
                            className="py-6 placeholder:text-[#616161]"
                        />
                        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
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
                        <p className="text-gray-700 text-sm">Gunakan password yang mudah anda ingat</p>

                        <ul className="text-sm ml-2 flex flex-col gap-1 text-gray-800">
                            <li className="flex items-center gap-2">
                                {/[a-z]/.test(watch("password")) ? "✅" : "❌"}
                                Mengandung huruf kecil
                            </li>
                            <li className="flex items-center gap-2">
                                {/[A-Z]/.test(watch("password")) ? "✅" : "❌"}
                                Mengandung huruf besar
                            </li>
                            <li className="flex items-center gap-2">
                                {/\d/.test(watch("password")) ? "✅" : "❌"}
                                Mengandung angka
                            </li>
                            <li className="flex items-center gap-2">
                                {/[[@$!%*?&]/.test(watch("password")) ? "✅" : "❌"}
                                Mengandung simbol (@, $, !, %, *, ?, &)
                            </li>
                            <li className="flex items-center gap-2">
                                {watch("password")?.length >= 6 ? "✅" : "❌"}
                                Minimal 6 karakter
                            </li>
                        </ul>

                        {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label
                            htmlFor="confirmPassword"
                            className="text-base font-semibold text-[#212121]"
                        >
                            Konfirmasi Password
                        </Label>
                        <Input
                            type="password"
                            id="confirmPassword"
                            {...register("confirmPassword")}
                            placeholder="Enter your password"
                            className="py-6 placeholder:text-[#616161]"
                        />
                        {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>}
                    </div>
                    <Button 
                        variant="secondary"   
                        size="lg"   
                        type="submit"
                        disabled={isPending}          
                        className="bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 transition-all duration-300 text-base md:text-xl p-2 text-white"
                    >
                        {isPending ? "Loading..." : "Register"}
                    </Button>
                    <p className="text-center text-gray-800 text-base">
                        Sudah memiliki akun?{" "}
                        <Link href="/auth/login" className="text-black font-medium hover:underline">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}