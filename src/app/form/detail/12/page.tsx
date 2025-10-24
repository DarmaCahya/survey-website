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
      title: "Data Leakage",
      description:
        "Kebocoran data sensitif akibat kesalahan konfigurasi sistem, akses tidak sah, atau pencurian data. Dampaknya meliputi pengungkapan informasi strategis perusahaan dan potensi kerugian finansial.",
    },
    {
      id: 2,
      title: "Distributed Denial of Service (DDoS)",
      description:
        "Serangan lalu lintas yang membuat website atau layanan online tidak dapat diakses. Dampaknya termasuk terganggunya operasional dan hilangnya kepercayaan pelanggan.",
    },
    {
      id: 3,
      title: "Privilege Escalation",
      description:
        "Eksploitasi yang memungkinkan pihak tidak berwenang memperoleh hak akses lebih tinggi dalam sistem daripada seharusnya. Dampaknya: data sensitif bisa diakses atau diubah tanpa izin.",
    },
    {
      id: 4,
      title: "Supply-chain Compromise",
      description:
        "Kompromi pada rantai pasokan atau vendor yang dapat menyebabkan gangguan layanan atau kebocoran data perusahaan. Dampaknya: operasional terganggu dan risiko reputasi meningkat.",
    },
    {
      id: 5,
      title: "Unauthorized Access",
      description:
        "Akses ke sistem atau data oleh pihak yang tidak berwenang akibat kontrol keamanan yang lemah. Dampaknya termasuk pencurian data, gangguan operasional, dan potensi kerugian finansial.",
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

  // Logic filter pertanyaan dinamis
  const filteredQuestions = questions.filter((q) => {
    const understanding = answers[page]?.["pemahaman_poin"];

    // "pemahaman_poin" selalu tampil
    if (q.id === "pemahaman_poin") return true;

    // Pertanyaan tambahan (required: false) muncul hanya jika user pilih "Tidak Mengerti"
    if (!q.required) return understanding === "Tidak Mengerti";

    // Pertanyaan utama (slider dsb) selalu tampil
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
          Sistem / Cloud (Drive/Server/ERP)
        </h1>

        <p className="text-justify leading-relaxed">
          Sistem dan layanan cloud mencakup platform seperti cloud storage, server internal, atau ERP yang digunakan untuk menyimpan file bisnis, laporan, dashboard penjualan, dan data operasional lainnya. Data ini digunakan untuk memonitor bisnis, membuat keputusan, serta mendukung kegiatan penjualan, pembelian, produksi, dan keuangan.
          Karena menyimpan informasi sensitif dan strategis perusahaan, aset ini termasuk kategori data kritikal. Gangguan atau kebocoran data pada sistem cloud dapat menimbulkan kerugian finansial, gangguan operasional, dan risiko reputasi.
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