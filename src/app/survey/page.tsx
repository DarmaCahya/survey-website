'use client';

import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { questions } from '@/data/question';
import QuestionFields from '@/components/Survey/questionFields';
import { toast } from 'sonner';
import { useGetAllForms } from '@/hooks/forms/useGetAllForms';

export default function Survey() {
    const {forms, loading, error} = useGetAllForms();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
      
        const formData = new FormData(e.currentTarget);
        const entries = Object.fromEntries(formData.entries());
      
        try {
            const promise = fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entries),
            }).then((res) => {
                if (!res.ok) throw new Error("Gagal kirim");
                return res.json();
            });
        
            toast.promise(promise, {
                loading: "Mengirim kuesioner...",
                success: "Kuesioner berhasil dikirim 🎉",
                error: "Terjadi kesalahan, silakan coba lagi.",
            });
        
            await promise;
            e.currentTarget.reset();
        } catch (error) {
            console.error(error);
        }
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

                <div className='flex flex-col items-center text-center gap-4 mb-10'>
                    <h1 className="font-bold text-4xl bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                        Kuesioner Keamanan Data UMKM
                    </h1>
                    <p className="text-base text-gray-500 text-justify">
                        Kuesioner ini bertujuan untuk memetakan tingkat kesadaran dan kesiapan pelaku UMKM dalam melindungi data bisnis dari berbagai ancaman siber.
                        Melalui isian ini, kami ingin memahami seberapa besar pengetahuan, dampak, frekuensi, dan kemampuan pemulihan yang dimiliki setiap usaha dalam menghadapi risiko seperti phishing, penipuan pembayaran, dan kebocoran data.

                        Hasil dari kuesioner ini akan digunakan untuk analisis risiko dan penyusunan rekomendasi peningkatan keamanan data bagi UMKM di Indonesia.
                    </p>
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