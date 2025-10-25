"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-b from-purple-50 to-white px-6">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="flex flex-col items-center"
            >
                <Sparkles className="h-16 w-16 text-purple-500 mb-6 animate-pulse" />

                <h1 className="text-7xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-4">
                    403
                </h1>

                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Halaman Tidak Bisa Diakses
                </h2>

                <p className="text-gray-500 max-w-md mb-8">
                    Maaf anda tidak bisa memasuki halaman ini, 
                    Mohon untuk melakukan login terlebih dahulu.
                </p>

                <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 text-white px-8 py-6 text-lg transition-all duration-300"
                    >
                    <Link href="/auth/login">Login</Link>
                </Button>
            </motion.div>
        </div>
    );
}