"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, CheckCircle2, Clock } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useThreatsByFormId } from "@/hooks/forms/useThreatsByFormId";
import RiskSummary from "@/components/form/RiskSummary";

export default function SurveyPage() {
    const params = useParams();
    const id = params?.id as string;
    const { Threats, loading, error } = useThreatsByFormId(id);

    const completedForm =
        Threats?.summary.total === Threats?.summary.completed &&
        Threats?.summary.notStarted === 0;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Spinner className="w-12 h-12 text-purple-600 mb-4" />
                <p className="text-gray-500 text-lg animate-pulse">Loading survey...</p>
            </div>
        );
    }

    if (error || !Threats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-500 text-lg font-medium">Error loading survey!</p>
            </div>
        );
    }

    const asset = Threats.asset;

    return (
        <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-2xl p-6 my-10">
            <div className="mb-4 flex items-center justify-between">
                <Link href="/dashboard">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-sm md:text-base font-normal border-gray-300 hover:bg-gray-100 transition-all duration-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar
                    </Button>
                </Link>
            </div>

            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-purple-600">
                    Form Risiko untuk {asset?.["title-data"]}
                </h2>
                <p className="text-gray-600 text-base mt-2">
                    Silakan isi form berikut berdasarkan ancaman yang teridentifikasi untuk aset ini.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                {Threats?.threats.map((threat) => {
                const isCompleted = !!threat.submission;
                    return (
                        <div
                            key={threat.id}
                            className="flex flex-col md:flex-row md:items-center justify-between border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                        <div>
                            <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-500" />
                                {threat.name}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                {threat.description || "Tidak ada deskripsi."}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 mt-3 md:mt-0">
                            {isCompleted ? (
                                <>
                                    <CheckCircle2 className="text-green-500 w-5 h-5" />
                                    <span className="text-green-600 font-medium text-sm">
                                        Selesai
                                    </span>
                                    <Link href={`/dashboard/form/${id}/threat/${threat.id}`}>
                                        <Button variant="outline" className="text-sm">
                                            Lihat Hasil
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Clock className="text-yellow-500 w-5 h-5" />
                                    <span className="text-yellow-600 font-medium text-sm">
                                        Belum Diisi
                                    </span>
                                    <Link href={`/dashboard/form/${id}/threat/${threat.id}`}>
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
                                            Isi Form
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                        </div>
                    );
                })}
            </div>

            {completedForm && Threats?.threats.length > 0 && (
                <div className="mt-10 border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-semibold text-purple-600 mb-3">
                        Ringkasan Risiko
                    </h3>
                    <RiskSummary
                        submissions={Threats.threats.map((t) => t.submission)}
                    />
                </div>
            )}
        </div>
    );
}