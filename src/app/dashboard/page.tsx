'use client';

import Link from "next/link";

import { dataCategories } from "@/data/dataCategories"
import { Button } from "@/components/ui/button"

export default function Dashboard() {

    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="flex flex-col items-center justify-center gap-6 max-w-xs md:max-w-2xl xl:max-w-5xl w-full mt-10">
                <div className="flex flex-col items-center text-center gap-4">
                    <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-black leading-tight">
                        Kuesioner Perlindungan Data untuk <span className="text-purple-600">UMKM</span>
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl text-gray-500 max-w-3xl">
                        Kenali dan <span className="font-semibold text-purple-600">Lindungi Data Usaha Anda</span>
                    </p>
                </div>

                <div className="bg-white shadow-lg border border-black/10 rounded-2xl p-6 md:p-10 text-gray-700 mb-16">
                    <p className="text-base md:text-lg leading-relaxed text-justify">
                        Sebagai pelaku UMKM, Anda tentu mengelola berbagai jenis data setiap hari — mulai dari data pelanggan, transaksi, hingga informasi keuangan.
                        Kuesioner ini membantu Anda memahami jenis-jenis data yang Anda miliki dan risiko siber yang mungkin mengintainya.
                        Dengan memahami hal ini, Anda bisa mengambil langkah sederhana namun efektif untuk menjaga keamanan data usaha Anda.
                    </p>
                </div>

                <div className="flex flex-col items-center text-center gap-3 md:mb-4 xl:mb-8">
                    <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl text-black">
                        Kenali Jenis Data Usaha Anda
                    </h2>
                    <p className="text-gray-500 text-base md:text-lg max-w-3xl">
                        Sebelum memulai, yuk pahami dulu beberapa jenis data yang mungkin dimiliki oleh usaha Anda.
                        Dengan mengetahui hal ini, Anda bisa lebih waspada terhadap risiko keamanan siber.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {dataCategories.map((item, index) => {
                        const isSelesai = item.status === "selesai";
                        const isProses = item.status === "proses";

                        return (
                            <div 
                                key={index}
                                className="border border-black/10 bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 p-6 flex flex-col justify-between text-center"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col justify-center items-center">
                                        <h3 className="font-semibold text-center text-lg md:text-xl text-purple-600">{item.title}</h3>
                                        {/* Status badge */}
                                        <div className="">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${
                                                    isSelesai
                                                        ? "bg-green-100 text-green-700"
                                                        : isProses
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm md:text-base leading-relaxed hyphens-auto text-justify">
                                        {item.description}
                                    </p>
                                </div>

                                <Link href={`/form/detail/${index}`}>
                                    <Button 
                                        className={`mt-6 text-white text-sm md:text-base py-2 transition-all duration-300 ${
                                            isSelesai
                                                ? "bg-green-600 hover:bg-green-700"
                                                : isProses
                                                ? "bg-yellow-500 hover:bg-yellow-600"
                                                : "bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90"
                                        }`}
                                    >
                                        {isSelesai ? "Lihat Hasil" : isProses ? "Lanjutkan" : "Isi Form"}
                                    </Button>
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}