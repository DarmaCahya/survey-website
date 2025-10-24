"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface RiskModalProps {
  open: boolean
  onClose: () => void
}

export default function RiskModal({ open, onClose }: RiskModalProps) {
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
            <span className="font-medium">Peluang Serangan:</span>
            <span>75%</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Impact:</span>
            <span>65%</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total Risiko:</span>
            <span>48.75%</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Kategori:</span>
            <span className="text-purple-600 font-semibold">Sedang</span>
          </div>
          <div>
            <p className="font-medium">Ancaman Paling Mungkin:</p>
            <p className="text-gray-600 text-sm mt-1">
              Kebocoran API Key atau kredensial pihak ketiga
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-center">
          <Button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full transition-all duration-300"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}