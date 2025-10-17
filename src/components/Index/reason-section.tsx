import { reasons } from "@/data/reason";
import { Button } from "../ui/button";
import Link from "next/link";

export default function ReasonSection() {
    return (
        <section id="reasons">
            <div className="flex flex-col text-center items-center justify-center gap-6 py-16">
                <div>
                    <h2 className="font-bold text-4xl text-black leading-tight">
                        Mengapa Partisipasi Anda Penting?
                    </h2>
                    <p className="text-lg text-gray-400">Feedback anda adalah kunci untuk menciptakan pengalaman yang baik</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full px-40">
                    {reasons.map((item, index) => {
                        const Icon = item.icon;
                        return (
                        <div
                            key={index}
                            className="border border-black/10 bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center gap-3 hover:scale-105 transition-transform duration-300"
                        >
                            <Icon className="h-10 w-10 text-purple-500" />
                            <p className="text-xl font-semibold">{item.title}</p>
                            <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                        );
                    })}
                </div>

                <div className="flex flex-col items-center justify-center gap-6 py-20">
                    <div>
                        <h2 className="font-bold text-4xl text-black leading-tight text-center">
                            Siap Berbagi Pengalaman Anda?
                        </h2>
                        <p className="text-lh text-gray-400">
                            Waktu pengisian hanya 3-5 menit, Setiap jawaban kamu sangat berarti bagi kami.
                        </p>
                    </div>
                    <Button 
                        asChild
                        variant="secondary"   
                        size="lg"             
                        className="bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 transition-all duration-300 text-lg p-6 text-white"
                    >
                        <Link href="/survey">
                            Mulai Sekarang
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )   
}