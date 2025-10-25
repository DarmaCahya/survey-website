import { FileLock } from 'lucide-react';
import Link from 'next/link';

import { Button } from "../ui/button"

export default function HeroSection() {
    return (
        <section>
            <div className="max-w-5xl flex flex-col items-center justify-center gap-6 py-14 lg:py-24 xl:py-32 px-6">
                <div className="border border-black/15 rounded-xl p-4 bg-gradient-to-r from-purple-500 to-purple-400">
                    <FileLock className="h-14 w-14 xl:h-20 xl:w-20 text-white mx-auto" />
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl xl:text-7xl text-black leading-tight text-center">
                        <span>Kuesioner Risiko</span>
                        <span className="block text-purple-600">
                            Keamanan Data UMKM
                        </span>
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-gray-400 max-w-3xl">
                        Melalui kuesioner ini, kami berupaya memetakan tingkat kesadaran dan kesiapan UMKM dalam melindungi data bisnis dari berbagai ancaman siber.                   
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button 
                        asChild
                        variant="secondary"   
                        size="lg"             
                        className="bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 transition-all duration-300 text-base md:text-xl p-2 text-white"
                    >
                        <Link href="/auth/login">
                            Mulai Kuesioner
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}