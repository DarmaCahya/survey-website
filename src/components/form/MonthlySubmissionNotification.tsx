"use client";

import { SubmissionEligibility } from "@/types/form";
import { AlertCircle } from "lucide-react";
import { getMonthPeriod } from "@/lib/month-utils";

interface MonthlySubmissionNotificationProps {
  eligibility: SubmissionEligibility;
}

export default function MonthlySubmissionNotification({
  eligibility,
}: MonthlySubmissionNotificationProps) {
  // Ditampilkan hanya ketika allAssetsCompleted = true (dipicu dari RiskSummary).

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();

      return `${day} ${month} ${year}`;
    } catch {
      return dateString;
    }
  };

  const lastSubmission = eligibility.lastSubmission;

  if (eligibility.allAssetsCompleted) {
    const currentMonthName = getMonthPeriod(
      eligibility.currentMonth,
      eligibility.currentYear
    ).split(" - ")[0]; // ambil awal untuk nama bulan/tahun singkat
    const currentPeriodLabel = `${currentMonthName.split(" ")[1]} ${eligibility.currentYear}`; // e.g. "Desember 2025"

    const nextPeriod = eligibility.nextSubmissionDate
      ? formatDate(eligibility.nextSubmissionDate)
      : null;

    return (
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="flex-1">
            <h3 className="mb-2 text-sm font-semibold text-blue-900">
              Informasi Pengisian Ulang Form
            </h3>
            <p className="mb-2 text-sm text-blue-800">
              Anda telah menyelesaikan semua form untuk periode{" "}
              <strong>{currentPeriodLabel}</strong>.
            </p>
            {nextPeriod && (
              <p className="mb-2 text-sm text-blue-700">
                Anda dapat mengisi form kembali mulai pada tanggal{" "}
                <strong>{nextPeriod}</strong>.
              </p>
            )}
            {lastSubmission && (
              <p className="mt-2 text-xs text-blue-600">
                Data terakhir diperbarui: {formatDate(lastSubmission.submittedAt)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

