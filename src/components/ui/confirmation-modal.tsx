"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Yes, Continue",
    cancelLabel = "Cancel",
}: ConfirmationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{title}</h3>
                                <p className="mt-2 text-zinc-400">{message}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-end gap-3">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="text-zinc-400 hover:text-white"
                            >
                                {cancelLabel}
                            </Button>
                            <Button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="bg-indigo-600 text-white hover:bg-indigo-500"
                            >
                                {confirmLabel}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
