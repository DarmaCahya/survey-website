"use client";

import { SubmissionEligibility } from "@/types/form";
import { AlertCircle, Calendar } from "lucide-react";

interface QuarterlySubmissionNotificationProps {
  eligibility: SubmissionEligibility;
}

export default function QuarterlySubmissionNotification({
  eligibility,
}: QuarterlySubmissionNotificationProps) {
  // This component is only called from RiskSummary when allAssetsCompleted = true
  // So we should always show the notification here, regardless of canSubmit
  // (canSubmit can be true if user can resubmit after completing all assets)

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} ${month} ${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const lastSubmission = eligibility.lastSubmission;

  // This component is only called from RiskSummary when allAssetsCompleted = true
  // Show informational message about resubmission
  if (eligibility.allAssetsCompleted) {
    const getQuarterPeriod = (quarter: number, year: number): string => {
      switch (quarter) {
        case 1:
          return `1 Januari - 31 Maret ${year}`;
        case 2:
          return `1 April - 30 Juni ${year}`;
        case 3:
          return `1 Juli - 30 September ${year}`;
        case 4:
          return `1 Oktober - 31 Desember ${year}`;
        default:
          return `Quartil ${quarter} ${year}`;
      }
    };

    const currentPeriod = getQuarterPeriod(eligibility.currentQuarter, eligibility.currentYear);
    const nextPeriod = eligibility.nextSubmissionDate 
      ? formatDate(eligibility.nextSubmissionDate) 
      : null;

    return (
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Informasi Pengisian Ulang Form
            </h3>
            <p className="text-sm text-blue-800 mb-2">
              Anda telah menyelesaikan semua form untuk periode <strong>{currentPeriod}</strong>.
            </p>
            {nextPeriod && (
              <p className="text-sm text-blue-700 mb-2">
                Anda dapat mengisi form kembali mulai pada tanggal <strong>{nextPeriod}</strong>.
              </p>
            )}
            {lastSubmission && (
              <p className="text-xs text-blue-600 mt-2">
                Data terakhir diperbarui: {formatDate(lastSubmission.submittedAt)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Should not reach here when called from RiskSummary, but return null for safety
  return null;
}

