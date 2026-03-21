"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", danger = false, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm rounded-xl bg-white border border-gray-200 shadow-xl p-6"
            onClick={e => e.stopPropagation()}
          >
            {danger && <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-400" />}
            <h3 className="text-center text-sm font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-center text-xs text-gray-500">{message}</p>
            <div className="mt-5 flex gap-3">
              <button onClick={onCancel} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">{cancelText}</button>
              <button onClick={onConfirm} className={`flex-1 rounded-lg py-2 text-sm font-medium text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-gray-800'}`}>{confirmText}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
