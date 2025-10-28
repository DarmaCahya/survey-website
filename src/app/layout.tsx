'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { NextStepProvider, NextStep, Tour } from 'nextstepjs';
import { useEffect, useState } from 'react';

const steps = [
  {
    tour: "mainTour",
    steps: [
      {
        icon: <span>👋</span>,
        title: "Selamat Datang",
        content: "Selamat datang di Dashboard! Yuk, kita mulai menjelajahi fitur-fitur yang tersedia untuk membantu mengelola rumah sakit dengan lebih mudah.",
        selector: "#dashboard-overview",
        side: "right" as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: <span>📋</span>,
        title: "14 Form yang Harus Diisi",
        content:
          "Terdapat 14 form berbeda yang perlu kamu isi untuk melengkapi proses penilaian. Masing-masing form memiliki topik tertentu, seperti ancaman (threat) atau faktor lain yang dinilai.",
        selector: "#forms-list",
        side: "top" as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: <span>🧭</span>,
        title: "Pilih Form untuk Dimulai",
        content:
          "Kamu bisa mulai dengan memilih salah satu form dari daftar di bawah ini. Klik pada form untuk mulai mengisinya.",
        selector: "#form-card",
        side: "bottom" as const,
        showControls: true,
        showSkip: true,
      },
    ],
  },
  {
    tour: "formTour",
    steps: [
      {
        icon: <span>🧠</span>,
        title: "Pengenalan Form",
        content:
          "Di bagian atas form, kamu akan melihat nama threat dan deskripsinya. Ini membantu kamu memahami konteks form sebelum mulai mengisi.",
        selector: "#form-header",
        side: "bottom" as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: <span>📝</span>,
        title: "Isi Pertanyaan",
        content:
          "Jawablah setiap pertanyaan di bawah ini. Pertanyaan dengan tanda bintang (*) berarti wajib diisi sebelum melanjutkan.",
        selector: "#form-questions",
        side: "top" as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: <span>🟰</span>,
        title: "Deskripsi Pertanyaan",
        content:
          "Beberapa pertanyaan terdapat deskripsi yang dapat membantu kamu memahami pertanyaan tersebut.",
        selector: "#form-description",
        side: "top" as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: <span>➡️</span>,
        title: "Navigasi Multi-Page",
        content:
          "Beberapa form memiliki lebih dari satu halaman (page). Gunakan tombol ‘Next’ untuk lanjut, dan tombol ‘Back’ untuk kembali ke halaman sebelumnya. Tekan Next hingga mencapai akhir halaman untuk melakukan submit form.",
        selector: "#form-navigation",
        side: "left" as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: <span>📤</span>,
        title: "Submit Form",
        content:
          "Setelah semua pertanyaan terisi, klik tombol ‘Submit’ untuk menyimpan jawabanmu.",
        selector: "#form-submit",
        side: "top" as const,
        showControls: true,
        showSkip: true,
      },
    ],
  },
  {
    tour: "resultTour",
    steps: [
      {
        icon: <span>📊</span>,
        title: "Lihat Hasil Penilaian",
        content:
          "Setelah mengirim form, kamu akan diarahkan ke halaman hasil. Di sini kamu bisa melihat ringkasan dari jawaban yang telah kamu isi.",
        selector: "#result-summary",
        side: "right" as const,
        showControls: true,
        showSkip: true,
      },
      {
        icon: <span>🔁</span>,
        title: "Kembali ke Dashboard!",
        content:
          "Kamu bisa kembali ke dashboard untuk melanjutkan form lainnya kapan saja. Semangat menyelesaikan semua form! 💪",
        selector: "#back-to-dashboard",
        side: "bottom" as const,
        showControls: true,
        showSkip: true,
      },
    ],
  },
] as Tour[];

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  const [showTour, setShowTour] = useState(false);
  const [queryClient] = React.useState(() => new QueryClient());

  useEffect(() => {
    const flag = localStorage.getItem('hasSeenTour');
    if (!flag) {
      setShowTour(true);
    }
  }, []);

  const handleComplete = (_tourName: string | null) => {
    localStorage.setItem('hasSeenTour', 'true');
    setShowTour(false);
  };

  const handleSkip = (_step: number, _tourName: string | null) => {
    localStorage.setItem("hasSeenTour", "true");
    setShowTour(false);
  };
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <QueryClientProvider client={queryClient}>
          <NextStepProvider>
            {showTour ? (
              <NextStep steps={steps}
                onComplete={handleComplete}
                onSkip={handleSkip}
              >
              {children}
              </NextStep>
            ) : (
              children
            )}
              <Toaster position="top-right" reverseOrder={false} />
              <ReactQueryDevtools initialIsOpen={false} />
          </NextStepProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}