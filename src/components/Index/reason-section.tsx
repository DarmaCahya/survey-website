import { reasons } from "@/data/reason";
import { Button } from "../ui/button";
import Link from "next/link";
import { Send } from "lucide-react";

export default function ReasonSection() {
    return (
        <section id="reasons">
            <div className="max-w-5xl flex flex-col text-center items-center justify-center gap-6 xl:py-16 px-6">
                <div className="flex flex-col items-center justify-center gap-2">
                    <h2 className="font-bold text-xl md:text-2xl lg:text-3xl xl:text-4xl text-black leading-tight">
                        Mengapa Partisipasi Anda Penting?
                    </h2>
                    <p className="text-sm md:text-lg lg:text-xl xl:text-lg text-gray-400">Feedback anda adalah kunci untuk menciptakan pengalaman yang baik</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 w-full xl:px-40">
                    {reasons.map((item, index) => {
                        const Icon = item.icon;
                        return (
                        <div
                            key={index}
                            className="border border-black/10 bg-white rounded-lg shadow-lg p-4 xl:p-6 flex flex-col items-center text-center gap-2 hover:scale-105 transition-transform duration-300"
                        >
                            <Icon className="h-8 w-8 md:h-10 md:w-10 text-purple-500" />
                            <p className="text-sm md:text-base lg:text-lg font-semibold">{item.title}</p>
                            <p className="text-gray-600 text-xs md:text-sm lg:text-base">{item.description}</p>
                        </div>
                        );
                    })}
                </div>

                <div className="flex flex-col items-center justify-center gap-4 lg:gap-6 py-4 md:py-6 lg:py-20">
                    <div>
                        <h2 className="font-bold text-xl md:text-2xl lg:text-3xl xl:text-4xl text-black leading-tight">
                            Siap Berbagi Pengalaman Anda?
                        </h2>
                        <p className="text-sm md:text-lg lg:text-xl xl:text-lg text-gray-400">
                            Waktu pengisian hanya 3-5 menit, Setiap jawaban kamu sangat berarti bagi kami.
                        </p>
                    </div>
                    <Button 
                        asChild
                        variant="secondary"   
                        size="lg"             
                        className="bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-80 transition-all duration-300 text-base md:text-xl p-6 text-white"
                    >
                        <Link href="/survey">
                            <Send className="h-6 w-6 mr-2" />
                            Mulai Sekarang
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )   
}