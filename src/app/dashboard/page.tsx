    'use client';

    import Link from "next/link";
    import { useNextStep } from "nextstepjs";

    import { Button } from "@/components/ui/button"
    import { useGetAllForms } from "@/hooks/forms/useGetAllForms";
    import { Spinner } from "@/components/ui/spinner";
    import React from "react";
    import { logout } from "@/services/AuthService";
    import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Dashboard() {
    const router = useRouter();
    const { forms, loading } = useGetAllForms();
    const { startNextStep } = useNextStep();

    React.useEffect(() => {
        startNextStep("mainTour");
    }, [startNextStep]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/auth/login");
        } catch (error) {
            console.error(error);
            toast.error("Logout failed");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="flex flex-col items-center justify-center gap-6 max-w-xs md:max-w-2xl xl:max-w-6xl w-full mt-10">
                <div className="absolute top-6 right-6">
                    <Button
                        onClick={handleLogout}
                        className="bg-linear-to-r mb-2 mt-4 from-purple-600 to-purple-400 hover:opacity-90 transition-all duration-300 text-white font-medium px-5 py-2 rounded-xl shadow-md hover:shadow-lg"
                    >
                        Logout
                    </Button>
                </div>

                <div id="dashboard-overview" className="flex flex-col items-center text-center gap-4">
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

                <div id="forms-list" className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 mb-10">
                    {loading && (
                    <div className="col-span-full flex flex-col items-center justify-center py-10">
                        <Spinner className="w-10 h-10 text-purple-600 mb-4" />
                        <p className="text-gray-500 text-lg animate-pulse">Loading forms...</p>
                    </div>
                    )}                    
                    {!loading && forms?.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-10">
                        <p className="text-gray-400 text-lg font-medium">
                        Tidak ada kuesioner yang tersedia saat ini.
                        </p>
                    </div>
                    )}                    
                    {forms?.map((item, index) => {
                        const isSelesai = item.status === "COMPLETED";
                        const isProses = item.status === "IN_PROGRESS";

                        return (
                            <div 
                                id="form-card"
                                key={index}
                                className="border border-black/10 bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 p-6 flex flex-col justify-between text-center"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col justify-center items-center gap-2">
                                        <h3 className="font-semibold text-center text-lg md:text-xl text-purple-600">{item.name}</h3>
                                        <div>
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${
                                                    isSelesai
                                                        ? "bg-green-100 text-green-700"
                                                        : isProses
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                {isSelesai ? "Selesai" : isProses ? "Sedang Proses" : "Belum Mulai"}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm md:text-base leading-relaxed hyphens-auto text-justify">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href={`/dashboard/form/${item.id}`}
                                >
                                    <Button
                                        className={`mt-6 text-white text-sm md:text-base py-2 transition-all duration-300 ${
                                        isSelesai
                                            ? "bg-green-600 hover:bg-green-700"
                                            : isProses
                                            ? "bg-yellow-500 hover:bg-yellow-600"
                                            : "bg-linear-to-r from-purple-600 to-purple-400 hover:opacity-90"
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