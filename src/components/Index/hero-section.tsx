import { BookOpenCheck } from 'lucide-react';
import Link from 'next/link';

import { Button } from "../ui/button"

export default function HeroSection() {
    return (
        <section>
            <div className="flex flex-col items-center justify-center gap-6 py-32">
                <div className="border border-black/15 rounded-xl p-4 bg-gradient-to-r from-purple-500 to-purple-400 ">
                    <BookOpenCheck className="h-20 w-20 text-white mx-auto" />
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <h1 className="font-bold text-7xl text-black leading-tight text-center">
                        <span>Kuesioner</span>
                        <span className="block text-purple-600">
                            Kepuasan Pengguna
                        </span>
                    </h1>
                    <p className="text-2xl text-gray-400 max-w-4xl">Bantu kami memberikan pelayanan terbaik dengan berbagi pengalaman dan pendapat anda melalui kuesioner singkat ini</p>
                </div>
                <div className="flex gap-4">
                    <Button 
                        asChild
                        variant="secondary"   
                        size="lg"             
                        className="bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 transition-all duration-300 text-lg p-6 text-white"
                    >
                        <Link href="/survey">
                            Mulai Kuesioner
                        </Link>
                    </Button>
                    <Button 
                        variant="outline" 
                        size="lg"
                        className="p-6 hover:bg-gray-100 text-lg"
                    >
                        <a href="#reasons" className="scroll-smooth">
                            Pelajari Lebih Lanjut
                        </a>
                    </Button>
                </div>
            </div>
        </section>
    )
}