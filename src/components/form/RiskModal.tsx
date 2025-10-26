"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SubmissionDescription } from "@/types/form"
import { useState } from "react";

interface RiskModalProps {
  open: boolean;
  onClose: () => void;
  submissions: SubmissionDescription[];
}

export default function RiskModal({ open, onClose, submissions }: RiskModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!submissions || submissions.length === 0) return null;

    const current = submissions[currentIndex];
    const handlePrev = () => {
    setCurrentIndex(i => (i > 0 ? i - 1 : i));
    }

    const handleNext = () => {
    setCurrentIndex(i => (i < submissions.length - 1 ? i + 1 : i));
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white rounded-2xl shadow-xl border border-purple-200 p-6">
                <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-purple-700 text-center">
                    💡 Hasil Analisis Risiko
                </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-gray-700 mt-2">
                    <div className="flex justify-between">
                        <span className="font-medium">Submission ID:</span>
                        <span>{current.submissionId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Peluang Serangan:</span>
                        <span>{current.score.peluang * 25}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Impact:</span>
                        <span>{current.score.impact * 25}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Total Risiko:</span>
                        <span>{current.score.total * 3.125}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Kategori:</span>
                        <span className="text-purple-600 font-semibold">{current.score.category}</span>
                    </div>
                    <div>
                        <p className="font-medium">Ancaman:</p>
                        <p className="text-gray-600 text-sm mt-1">{current.threatDescription.threatName}</p>
                        <p className="text-gray-600 text-sm mt-1">{current.threatDescription.description}</p>
                        <ul className="list-disc list-inside text-sm mt-2">
                            {current.threatDescription.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <DialogFooter className="mt-6 flex justify-between">
                    <Button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full"
                    >
                        Sebelumnya
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={currentIndex === submissions.length - 1}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full"
                    >
                        Berikutnya
                    </Button>
                    <Button
                        onClick={onClose}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full"
                    >
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}