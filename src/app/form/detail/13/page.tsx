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
      title: "Web Injection / Defacement",
      description:
        "Perubahan atau injeksi kode di website yang dapat mengarahkan pelanggan ke tautan berbahaya atau merusak reputasi bisnis. Dampaknya termasuk hilangnya kepercayaan pelanggan dan potensi kerugian finansial.",
    },
    {
      id: 2,
      title: "Distributed Denial of Service (DDoS)",
      description:
        "Serangan lalu lintas yang membuat website atau layanan online tidak dapat diakses. Dampaknya meliputi terganggunya transaksi, penurunan pendapatan, dan reputasi bisnis terdampak.",
    },
    {
      id: 3,
      title: "Payment Fraud (Checkout Manipulation)",
      description:
        "Modifikasi proses pembayaran oleh pihak jahat, misalnya mengubah nominal, menonaktifkan verifikasi pembayaran, atau mengirim bukti transfer palsu agar barang dikirim tanpa pembayaran sah. Dampaknya: kerugian finansial langsung dan gangguan operasional.",
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

  /**
   * Filter pertanyaan dinamis:
   * - Semua pertanyaan slider & radio utama tetap muncul
   * - Pertanyaan required:false (seperti “pemahaman_tidak_mengerti”, “penjelasan_tidak_dipahami”)
   *   hanya muncul kalau jawaban "pemahaman_poin" === "Tidak Mengerti"
   */
  const filteredQuestions = questions.filter((q) => {
    const understanding = answers[page]?.["pemahaman_poin"];

    // "pemahaman_poin" selalu muncul
    if (q.id === "pemahaman_poin") return true;

    // Pertanyaan tambahan hanya muncul jika user pilih "Tidak Mengerti"
    if (!q.required) return understanding === "Tidak Mengerti";

    // Pertanyaan utama (required: true, selain pemahaman_poin) selalu muncul
    return true;
  });

  return (
    <section className="px-6 py-14 max-w-5xl mx-auto">
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

      <div className="space-y-2 text-gray-800">
        <h1 className="text-3xl font-semibold text-purple-700">
          Website / E-commerce / Landing Page
        </h1>

        <p className="text-justify leading-relaxed">
          Website atau e-commerce mencakup situs toko online, landing page produk, dan platform digital lainnya yang menampilkan informasi bisnis serta menerima pesanan dari pelanggan. Data yang tersimpan dapat berupa detail produk, inventaris, pesanan, dan interaksi pelanggan.
          Karena menjadi titik utama transaksi dan interaksi pelanggan, aset ini termasuk kategori data kritikal. Gangguan, manipulasi, atau kebocoran data pada website dapat menyebabkan kerugian finansial, rusaknya reputasi, dan hilangnya kepercayaan pelanggan.
        </p>
      </div>

      <div className="text-gray-800 mt-4">
        <h2 className="text-xl font-semibold text-purple-600">
          {threats[page - 1].title}
        </h2>
        <p className="text-justify leading-relaxed text-gray-700">
          {threats[page - 1].description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {filteredQuestions.map((question) => (
          <QuestionFields
            key={question.id}
            question={question}
            value={answers[page]?.[question.id] || ""}
            onChange={(id, val) => handleAnswerChange(id, val as string)}
          />
        ))}

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