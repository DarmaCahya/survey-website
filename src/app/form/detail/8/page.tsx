"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { questions } from "@/data/question";
import QuestionFields from "@/components/Survey/questionFields";
import RiskModal from "@/components/form/RiskModal";

export default function DetailForm() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [answers, setAnswers] = useState<Record<number, Record<string, string>>>({});

  const threats = [
    {
      id: 1,
      title: "Unauthorized Access",
      description:
        "Akses ke jaringan atau perangkat dilakukan oleh pihak yang tidak berhak, misalnya akibat password lemah, kredensial dibagikan sembarangan, atau akun diretas. Dampaknya meliputi penyalahgunaan sistem, pencurian data transaksi, dan gangguan operasional.",
    },
    {
      id: 2,
      title: "Man-in-the-Middle Attack",
      description:
        "Serangan di mana pelaku menyadap komunikasi antara perangkat pengguna dan sistem, misalnya saat transaksi online. Pelaku dapat mencuri data login, informasi pembayaran, atau mengubah data yang dikirim. Dampaknya: pencurian data sensitif dan potensi kerugian finansial.",
    },
  ];

  const totalPages = threats.length;

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        [questionId]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (page < totalPages) {
      console.log(`Selesai halaman ${page}:`, threats[page - 1].title);
      setPage(page + 1);
    } else {
      console.log("Submit terakhir:", threats[page - 1].title);
      setOpen(true);
    }
  };

  const handleBack = () => {
    if (page > 1) setPage(page - 1);
  };

  // 🔹 Filter pertanyaan dinamis (seperti versi lengkap)
  const filteredQuestions = questions.filter((q) => {
    const understanding = answers[page]?.["pemahaman_poin"];

    if (q.id === "pemahaman_poin") return true;
    if (!q.required) return understanding === "Tidak Mengerti";
    return true;
  });

  return (
    <section className="px-6 py-14 max-w-5xl mx-auto">
      {/* Header Navigasi */}
      <div className="mb-8 flex items-center justify-between">
        <Link href="/form">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-sm md:text-base border-gray-300 hover:bg-gray-100 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar
          </Button>
        </Link>

        <span className="text-sm text-gray-600">
          Halaman {page} dari {totalPages}
        </span>
      </div>

      {/* Deskripsi Aset */}
      <div className="space-y-2 text-gray-800">
        <h1 className="text-3xl font-semibold text-purple-700">
          Konfigurasi Jaringan / Wi-Fi Toko
        </h1>

        <p className="text-justify leading-relaxed">
          Konfigurasi jaringan toko mencakup setelan Wi-Fi dan jaringan lokal yang menghubungkan perangkat kasir, printer, komputer staf, serta perangkat IoT lainnya. Data ini digunakan untuk memastikan operasional harian berjalan lancar, termasuk transaksi penjualan, cetak struk, dan akses sistem internal.
          Karena menyangkut akses ke sistem operasional dan data transaksi, aset ini termasuk kategori data sensitif. Akses tidak sah atau gangguan jaringan dapat menyebabkan gangguan operasional, pencurian data transaksi, dan potensi kerugian finansial.
        </p>
      </div>

      {/* Threat Section */}
      <div className="text-gray-800 mt-4">
        <h2 className="text-xl font-semibold text-purple-600">
          {threats[page - 1].title}
        </h2>
        <p className="text-justify leading-relaxed text-gray-700">
          {threats[page - 1].description}
        </p>
      </div>

      {/* Form Pertanyaan */}
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {filteredQuestions.map((question) => (
          <QuestionFields
            key={question.id}
            question={question}
            value={answers[page]?.[question.id] || ""}
            onChange={(id, val) => handleAnswerChange(id, val as string)}
          />
        ))}

        {/* Navigasi Form */}
        <div
          className={`flex ${
            page === 1 ? "justify-center" : "justify-between"
          } mt-10`}
        >
          {page > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-100 text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          )}

          <Button
            variant="secondary"
            size="lg"
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 transition-all duration-300 text-base md:text-lg p-5 text-white shadow-md rounded-xl"
          >
            {page < totalPages ? (
              <>
                Lanjutkan
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Kirim Kuesioner
              </>
            )}
          </Button>
        </div>
      </form>

      <RiskModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
