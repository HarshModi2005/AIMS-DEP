"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: "default" | "destructive" | "success" | "warning";
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    variant = "default",
}: ConfirmationModalProps) {
    // Backdrop animation
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    // Modal animation
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 10 },
    };

    // Determine icon and colors based on variant
    const getVariantStyles = () => {
        switch (variant) {
            case "destructive":
                return {
                    icon: AlertTriangle,
                    iconColor: "text-red-500",
                    iconBg: "bg-red-500/10",
                    buttonVariant: "destructive" as const,
                };
            case "success":
                return {
                    icon: CheckCircle,
                    iconColor: "text-emerald-500",
                    iconBg: "bg-emerald-500/10",
                    buttonVariant: "default" as const, // We'll just use default for success for now or add a custom class
                };
            case "warning":
                return {
                    icon: AlertTriangle,
                    iconColor: "text-amber-500",
                    iconBg: "bg-amber-500/10",
                    buttonVariant: "default" as const,
                };
            default:
                return {
                    icon: Info,
                    iconColor: "text-indigo-500",
                    iconBg: "bg-indigo-500/10",
                    buttonVariant: "default" as const,
                };
        }
    };

    const styles = getVariantStyles();
    const Icon = styles.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={backdropVariants}
                        onClick={!isLoading ? onClose : undefined}
                        transition={{ duration: 0.2 }}
                    />

                    {/* Modal */}
                    <motion.div
                        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-xl"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={modalVariants}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${styles.iconBg}`}>
                                    <Icon className={`w-6 h-6 ${styles.iconColor}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {title}
                                    </h3>
                                    <div className="text-zinc-400 text-sm leading-relaxed">
                                        {description}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-white/5">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                disabled={isLoading}
                                className="text-zinc-400 hover:text-white"
                            >
                                {cancelText}
                            </Button>
                            <Button
                                variant={styles.buttonVariant}
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={variant === "success" || variant === "default" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}
                            >
                                {isLoading ? "Processing..." : confirmText}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
