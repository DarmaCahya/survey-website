'use client';

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { mockResponses } from "@/data/responses";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Chart from "@/components/Result/chart";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

export default function Result() {
    const [authorized, setAuthorized] = useState(false);
    const [password, setPassword] = useState(""); 
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
    
        const correct = process.env.NEXT_PUBLIC_RESULT_PASS ?? "rahasia123";
    
        setTimeout(() => { 
            if (password === correct) {
                toast.success("Akses diterima 🎉");
                setAuthorized(true);
            } else {
                toast.error("Password salah ❌, kamu tidak memiliki akses");
                setPassword("");
            }
            setLoading(false);
        }, 500);
    };    

    if (!authorized) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-purple-50 to-white text-center px-4"
            >
                <div className="max-w-md w-full bg-white border border-gray-200 shadow-md rounded-xl p-8 space-y-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                        Masukkan Password
                    </h1>
                    <p className="text-gray-500">
                        Halaman ini hanya dapat diakses oleh admin.
                    </p>
            
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password"
                        disabled={loading}
                        className="w-full border-b-2 border-gray-300 focus:border-purple-500 p-2 text-gray-800"
                        />
            
                        <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 text-white"
                        disabled={loading || password.length === 0}
                        >
                        Lanjutkan
                        </Button>
                    </form>
            
                    <Button asChild variant="ghost" className="text-gray-500 hover:text-black mt-4">
                        <Link href="/">← Kembali ke Beranda</Link>
                    </Button>
                </div>
            </motion.div>
        );
    }     

    return (
        <div className="min-h-screen py-12 px-4 bg-[#fbfbfc]">
            <div className='max-w-5xl mx-auto'>
                <Button 
                    className='gap-4 mb-8'
                    asChild
                    variant="secondary"   
                    size="lg" 
                >
                    <Link href="/">
                        <ArrowLeft className="h-16 w-16 text-black" />
                        Kembali
                    </Link> 
                </Button>

                <div className='flex flex-col items-center text-center gap-4 mb-12'>
                    <h1 className="font-bold text-5xl bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                        Hasil Kuesioner
                    </h1>
                </div>
                
                <div className="flex flex-col items-center justify-center gap-8">
                    <div className="w-full rounded-xl border border-gray-200 shadow-sm bg-white p-6">
                        <p className="text-2xl text-black font-medium text-center pb-4">Daftar jawaban dari user</p>
                        <ScrollArea className="h-[25rem]">
                            <div>
                                <Accordion type="single" collapsible className="w-full space-y-2">
                                    {mockResponses.map((response, index) => (
                                        <AccordionItem
                                            key={index}
                                            value={`response-${index}`}
                                            className="border border-gray-200 rounded-lg shadow-sm bg-gray-50"
                                        >
                                            <AccordionTrigger className="px-4 py-3 text-left text-lg font-semibold text-gray-800 hover:bg-purple-50 rounded-lg transition">
                                                {response.respondent.name}
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 py-4 space-y-3 bg-white rounded-b-lg">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Email:</span> {response.respondent.email}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Dikirim pada:</span> {new Date(response.respondent.submittedAt).toLocaleString()}
                                                </p>

                                                <div className="pt-3 border-t border-gray-200 space-y-2">
                                                    {response.answers.map((ans, i) => (
                                                        <div key={i} className="p-3 rounded-md bg-gray-100">
                                                            <p className="text-sm font-medium text-gray-800">
                                                                {ans.questionId}
                                                            </p>
                                                            <p className="text-sm text-gray-700">
                                                                {Array.isArray(ans.value) ? ans.value.join(", ") : ans.value}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </ScrollArea>
                        <p className="mt-4">
                            Total Responden: {mockResponses.length} user
                        </p>
                    </div>
                </div>

                <Chart />
            </div>
        </div>
    );
}
