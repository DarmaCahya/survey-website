"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SubmissionDescription, SubmissionEligibility } from "@/types/form";
import { useNextStep } from "nextstepjs";
import React from "react";
import MonthlySubmissionNotification from "./MonthlySubmissionNotification";

interface RiskSummaryProps {
  submissions: SubmissionDescription[];
  submissionEligibility?: SubmissionEligibility;
}

export default function RiskSummary({ submissions, submissionEligibility }: RiskSummaryProps) {
    const { startNextStep } = useNextStep();

    React.useEffect(() => {
        startNextStep("resultTour");
    }, [startNextStep]);

    const [currentIndex, setCurrentIndex] = useState(0);

    if (!submissions || submissions.length === 0) return null;

    const current = submissions[currentIndex];

    const handlePrev = () => setCurrentIndex(i => (i > 0 ? i - 1 : i));
    const handleNext = () => setCurrentIndex(i => (i < submissions.length - 1 ? i + 1 : i));

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Tinggi": return "text-red-600";
            case "Sedang": return "text-yellow-600";
            case "Rendah": return "text-green-600";
            default: return "text-gray-700";
        }
    }

    return (
        <div id="result-summary" className="mt-6 mx-auto p-6 space-y-4">
            {/* Show resubmission notification only if all assets completed */}
            {submissionEligibility && submissionEligibility.allAssetsCompleted && (
                <MonthlySubmissionNotification eligibility={submissionEligibility} />
            )}
            
            <h3 className="text-xl font-semibold text-center text-purple-700">
                💡 Hasil Analisis Risiko
            </h3>

            <div className="space-y-2">
                {/* <div className="flex justify-between">
                    <span className="font-medium">Submission ID:</span>
                    <span className="font-mono text-gray-600">{current.submissionId}</span>
                </div>

                <div className="flex justify-between">
                    <span className="font-medium">Peluang Serangan:</span>
                    <span className="font-semibold">{current.score.peluang}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Impact:</span>
                    <span className="font-semibold">{current.score.impact}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Total Risiko:</span>
                    <span className="font-semibold">{current.score.total}</span>
                </div> */}
                <div className="flex justify-between">
                    <span className="font-medium">Kategori:</span>
                    <span className={`font-semibold ${getCategoryColor(current.score.category)}`}>
                        {current.score.category}
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
                <p className="font-medium text-gray-800">Ancaman:</p>
                <p className="text-gray-600 text-sm font-semibold">{current.threatDescription.threatName}</p>
                <p className="text-gray-600 text-sm">{current.threatDescription.description}</p>
                {current.threatDescription.recommendations.length > 0 && (
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                        {current.threatDescription.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-gray-600">{rec}</li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-4 flex justify-between">
                <Button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full"
                >
                    Sebelumnya
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={currentIndex === submissions.length - 1}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full"
                >
                    Berikutnya
                </Button>
            </div>
        </div>
    );
}