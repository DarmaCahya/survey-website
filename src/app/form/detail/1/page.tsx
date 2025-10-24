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
      title: "Brute Force",
      description:
        "Upaya otomatis untuk menebak kata sandi berkali-kali hingga berhasil masuk ke akun marketplace. Serangan ini biasanya dilakukan oleh bot yang mencoba berbagai kombinasi password umum atau lemah. Bila berhasil, penyerang dapat mengakses akun seller secara penuh.",
    },
    {
      id: 2,
      title: "Account Takeover (ATO)",
      description:
        "Serangan di mana penyerang berhasil mengambil alih akun marketplace melalui pencurian kredensial, phishing, atau brute force. Setelah berhasil, pelaku dapat mengganti informasi akun, menarik dana, mengubah harga produk, atau menipu pelanggan.",
    },
    {
      id: 3,
      title: "Credential Stuffing",
      description:
        "Penggunaan kombinasi username dan password yang bocor dari layanan lain untuk mencoba login ke akun marketplace. Karena banyak pengguna memakai kredensial yang sama di beberapa platform, serangan ini sangat efektif untuk mengambil alih banyak akun sekaligus.",
    },
    {
      id: 4,
      title: "Phishing / Social Engineering",
      description:
        "Penyerang mengirim pesan palsu melalui email, WhatsApp, atau DM yang meniru pihak resmi (misalnya marketplace atau bank) untuk menipu pemilik akun agar memberikan kata sandi, OTP, atau klik tautan berbahaya. Cara ini sering digunakan untuk mencuri akses akun seller.",
    },
  ];

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
    if (page < threats.length) {
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

  // Filter pertanyaan: required:false hanya tampil jika pemahaman_poin = "Tidak Mengerti"
  const filteredQuestions = questions.filter((q) => {
    const understanding = answers[page]?.["pemahaman_poin"];
    if (q.id === "pemahaman_poin") return true; // selalu tampil
    if (!q.required) return understanding === "Tidak Mengerti"; // tampil jika "Tidak Mengerti"
    return true; // required selalu tampil
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
          Halaman {page} dari {threats.length}
        </span>
      </div>

      <div className="space-y-2 text-gray-800">
        <h1 className="text-3xl font-semibold text-purple-700">
          Akun Marketplace / Seller Account
        </h1>

        <p className="text-justify leading-relaxed">
          Akun di platform marketplace seperti Tokopedia, Shopee, dan sejenisnya digunakan untuk
          mengelola toko online, data produk, transaksi, serta interaksi dengan pelanggan. Akun
          ini biasanya mencakup data toko, saldo penjualan, pengaturan logistik, serta kredensial
          akses (username, password, dan sistem admin). Karena berhubungan langsung dengan transaksi
          keuangan dan reputasi bisnis, akun seller menjadi target utama berbagai serangan siber.
          Jika akun ini dikompromikan, pelaku dapat mengambil alih toko, mengubah data produk,
          menarik saldo, hingga mencuri data pelanggan.
        </p>
      </div>

      <div className="text-gray-800 mt-4">
        <h2 className="text-xl font-semibold text-purple-600">{threats[page - 1].title}</h2>
        <p className="text-justify leading-relaxed text-gray-700">{threats[page - 1].description}</p>
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

        <div className={`flex ${page === 1 ? "justify-center" : "justify-between"} mt-10`}>
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
            {page < threats.length ? (
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