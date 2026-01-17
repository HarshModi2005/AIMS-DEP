
"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarUploadProps {
    sessionId: string;
    onUploadComplete?: (data: any) => void;
}

export default function CalendarUpload({ sessionId, onUploadComplete }: CalendarUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== "application/pdf") {
                setError("Please upload a PDF file");
                return;
            }
            setFile(selectedFile);
            setError(null);
            setSuccess(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const selectedFile = e.dataTransfer.files[0];
            if (selectedFile.type !== "application/pdf") {
                setError("Please upload a PDF file");
                return;
            }
            setFile(selectedFile);
            setError(null);
            setSuccess(null);
        }
    };

    const handleUpload = async () => {
        if (!file || !sessionId) return;

        setUploading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("sessionId", sessionId);

        try {
            const response = await fetch("/api/academic-calendar/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Upload failed");
            }

            setSuccess(`Successfully uploaded ${file.name}. Parsed ${data.eventsParsed} events.`);
            setFile(null);
            if (onUploadComplete) {
                onUploadComplete(data);
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setUploading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        setError(null);
        setSuccess(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full">
            <div
                className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center transition-colors relative cursor-pointer",
                    file ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/10 hover:border-white/20 hover:bg-zinc-900/50",
                    uploading && "opacity-50 pointer-events-none"
                )}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="application/pdf"
                    onChange={handleFileChange}
                />

                {file ? (
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-white">{file.name}</p>
                            <p className="text-sm text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); clearFile(); }}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors ml-4"
                        >
                            <X className="h-4 w-4 text-zinc-400" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mb-2">
                            <Upload className="h-6 w-6 text-zinc-400" />
                        </div>
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-zinc-500">PDF up to 10MB</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            {file && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                Upload & Parse
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Status Messages */}
            {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}
            {success && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                </div>
            )}
        </div>
    );
}
