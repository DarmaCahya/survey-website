'use client';

import { useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { getAnalyticDataByPin } from "@/services/AnalyticService";
import { AnalyticResponse } from "@/types/analytics";

export default function Result() {
    const [adminPin, setAdminPin] = useState("");
    const [analytics, setAnalytics] = useState<AnalyticResponse | null>(null);

    const mutation = useMutation<AnalyticResponse, Error, string>({
        mutationFn: getAnalyticDataByPin,
        onSuccess: (data) => {
        setAnalytics(data);
        toast.success("Akses diterima 🎉");
        },
        onError: (err) => {
        toast.error("PIN salah atau tidak memiliki akses ❌");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminPin) return toast.error("Harap isi PIN admin terlebih dahulu");
        mutation.mutate(adminPin);
    };

    if (!analytics) {
        return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-purple-50 to-white text-center px-4"
        >
            <div className="max-w-md w-full bg-white border border-gray-200 shadow-md rounded-xl p-8 space-y-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                    Masukkan PIN Admin
                </h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        type="password"
                        value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value)}
                        placeholder="Masukkan PIN admin"
                        disabled={mutation.isPending}
                    />
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 text-white"
                        disabled={mutation.isPending || adminPin.length === 0} 
                    >
                    {mutation.isPending ? "Memeriksa..." : "Lanjutkan"}
                    </Button>

                </form>
            </div>
        </motion.div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 bg-[#fbfbfc]">
            <h1 className="font-bold text-5xl text-center mb-12 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                Hasil Kuesioner
            </h1>
            <div className="max-w-5xl mx-auto bg-white border border-gray-200 shadow-md rounded-xl p-8">
                <h2 className="text-2xl font-semibold mb-6 text-purple-600">Ringkasan</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                    <p className="text-4xl font-bold text-purple-600">{analytics.data.summary.totalSubmissions}</p>
                    <p className="text-gray-600">Total Submissions</p>
                </div>
                <div>
                    <p className="text-4xl font-bold text-purple-600">{analytics.data.summary.totalUsers}</p>
                    <p className="text-gray-600">Total Users</p>
                </div>
                <div>
                    <p className="text-4xl font-bold text-purple-600">{analytics.data.summary.totalAssets}</p>
                    <p className="text-gray-600">Total Assets</p>
                </div>
                <div>
                    <p className="text-4xl font-bold text-purple-600">{analytics.data.summary.totalThreats}</p>
                    <p className="text-gray-600">Total Threats</p>
                </div>
                </div>
            </div>
        </div>
    );
}