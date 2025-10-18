'use client';

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { mockResponses } from "@/data/responses";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Chart from "@/components/Result/chart";

export default function Result() {
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
