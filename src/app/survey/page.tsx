'use client';

import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { questions } from '@/data/question';
import QuestionFields from '@/components/Survey/questionFields';
import { toast } from 'sonner';

export default function Survey() {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const simulateSubmit = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('ok');
            }, 1500);
        });
    
        toast.promise(simulateSubmit, {
            loading: 'Mengirim kuesioner...',
            success: 'Kuesioner berhasil dikirim 🎉',
            error: 'Terjadi kesalahan, silakan coba lagi.',
        });
    };

    return (
        <div className="min-h-screen py-12 px-4 bg-[#fbfbfc]">
            <div className='max-w-3xl mx-auto'>
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
                        Kuesioner Kepuasan
                    </h1>
                    <p className="text-lg text-gray-400">Silakan jawab semua pertanyaan berikut dengan lengkap</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {questions.map((question) => (
                        <QuestionFields key={question.id} question={question} />
                    ))}
                    <div className='flex justify-center mt-8'>
                        <Button 
                            variant="secondary"   
                            size="lg"        
                            type='submit'     
                            className="bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 transition-all duration-300 text-base md:text-xl p-6 text-white"
                        >
                            <Send className="h-6 w-6" />
                            Kirim Kuesioner
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}