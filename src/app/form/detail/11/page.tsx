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
      title: "Malware / Ransomware",
      description:
        "Program berbahaya yang dapat mencuri, mengenkripsi, atau merusak data pada perangkat. Serangan ini bisa membuat sistem tidak dapat digunakan tanpa membayar tebusan dan menyebabkan gangguan operasional serta kerugian finansial.",
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

  // Logic tampil pertanyaan
  const filteredQuestions = questions.filter((q) => {
    const understanding = answers[page]?.["pemahaman_poin"];

    // Pertanyaan “pemahaman_poin” selalu tampil
    if (q.id === "pemahaman_poin") return true;

    // Pertanyaan tambahan (required:false) muncul hanya jika user pilih "Tidak Mengerti"
    if (!q.required) return understanding === "Tidak Mengerti";

    // Pertanyaan utama selalu tampil
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
          Perangkat Kerja (HP / Laptop / POS)
        </h1>

        <p className="text-justify leading-relaxed">
          Perangkat kerja mencakup HP, laptop, dan perangkat POS yang digunakan staf untuk operasional harian, seperti kasir, komunikasi, pencatatan transaksi, atau akses akun bisnis. Data yang tersimpan di perangkat ini dapat berupa informasi pelanggan, transaksi, dokumen internal, dan kredensial akun.
          Karena menyimpan berbagai data sensitif dan akses ke sistem bisnis, aset ini termasuk kategori data kritikal. Kehilangan atau kompromi perangkat dapat mengakibatkan pencurian data, gangguan operasional, dan kerugian finansial.
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

        <div className="flex justify-center mt-10">
          <Button
            variant="secondary"
            size="lg"
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 transition-all duration-300 text-base md:text-lg p-5 text-white shadow-md rounded-xl"
          >
            {totalPages === 1 ? (
              <>
                <Send className="h-5 w-5 mr-2" />
                Kirim Kuesioner
              </>
            ) : page < totalPages ? (
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