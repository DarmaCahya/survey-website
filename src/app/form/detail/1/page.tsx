"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, ArrowRight } from "lucide-react";
import { questions } from "@/data/question";
import QuestionFields from "@/components/Survey/questionFields";
import Link from "next/link";
import RiskModal from "@/components/form/RiskModal";
import { useState } from "react";

export default function DetailForm() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Daftar ancaman per halaman
  const threats = [
    {
      id: 1,
      title: "Supply-Chain Compromise",
      description:
        "Serangan ini menargetkan vendor atau penyedia layanan yang terhubung dengan sistem bisnis Anda. Bila salah satu penyedia layanan mengalami kebocoran, maka penyerang bisa saja masuk ke sistem utama melalui celah tersebut. Risiko ini sering kali muncul tanpa disadari, karena kepercayaannya terhadap pihak ketiga.",
    },
    {
      id: 2,
      title: "Third-Party Compromise",
      description:
        "Ancaman ini muncul ketika sistem pihak ketiga seperti platform logistik, penyedia jasa, atau integrasi API mengalami kebocoran data. Melalui koneksi tersebut, penyerang dapat mengakses informasi pelanggan, transaksi, hingga mengambil kendali sebagian fungsi sistem bisnis Anda.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (page === 1) {
      // Lanjut ke halaman kedua
      console.log("Selesai halaman 1:", threats[0].title);
      setPage(2);
    } else {
      // Halaman terakhir: tampilkan hasil
      console.log("Submit terakhir:", threats[1].title);
      setOpen(true);
    }
  };

  const handleBack = () => {
    if (page > 1) setPage(page - 1);
  };

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
          Halaman {page} dari {threats.length}
        </span>
      </div>

      {/* Intro Section */}
      <div className="space-y-2 text-gray-800">
        <h1 className="text-3xl font-semibold text-purple-700">
          API & Integrasi Pihak Ketiga
        </h1>

        <p className="text-justify leading-relaxed">
          Banyak bisnis modern bergantung pada berbagai layanan pihak ketiga —
          mulai dari sistem pembayaran, logistik, hingga marketplace. Melalui
          integrasi API, data pelanggan, transaksi, dan status pengiriman dapat
          terhubung secara otomatis. Namun di balik kemudahan itu, terdapat
          risiko siber yang bisa berdampak besar jika tidak diantisipasi.
        </p>
      </div>

      {/* Threat Explanation */}
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
        {questions.map((question) => (
          <QuestionFields key={question.id} question={question} />
        ))}

        {/* Tombol Navigasi */}
        <div
          className={`flex ${
            page === 1 ? "justify-center" : "justify-between"
          } mt-10`}
        >
          {/* Tombol Back (hanya di page 2) */}
          {page === 2 && (
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

          {/* Tombol Next / Submit */}
          <Button
            variant="secondary"
            size="lg"
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 transition-all duration-300 text-base md:text-lg p-5 text-white shadow-md rounded-xl"
          >
            {page === 1 ? (
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

      {/* Popup Hasil Analisis Risiko */}
      <RiskModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
