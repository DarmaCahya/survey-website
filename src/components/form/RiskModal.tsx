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
  submissions: SubmissionDescription;
}

export default function RiskModal({ open, onClose, submissions }: RiskModalProps) {
    if (!submissions) return null;

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
                        <span className="font-medium">Kategori:</span>
                        <span className="text-purple-600 font-semibold">{submissions.score.category}</span>
                    </div>
                    <div>
                        <p className="font-medium">Ancaman:</p>
                        <p className="text-gray-600 text-sm mt-1">{submissions.threatDescription.threatName}</p>
                        <p className="text-gray-600 text-sm mt-1">{submissions.threatDescription.description}</p>
                        <ul className="list-disc list-inside text-sm mt-2">
                            {submissions.threatDescription.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <DialogFooter className="mt-6 flex justify-between">
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