
"use client";

import { useState, useRef, use, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, XCircle, Loader2, Save } from "lucide-react";
import * as XLSX from "xlsx";

interface GradeRow {
    name: string;
    enrollmentNumber: string;
    grade: string;
    status?: "PENDING" | "Valid" | "Invalid" | "Submitted";
    message?: string;
}

export default function GradeUploadPage({ params }: { params: Promise<{ offeringId: string }> }) {
    const unwrappedParams = use(params);
    const offeringId = unwrappedParams.offeringId;
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<GradeRow[]>([]);
    const [uploading, setUploading] = useState(false);
    const [validationReport, setValidationReport] = useState<any[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseFile(selectedFile);
        }
    };

    const parseFile = async (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Assume header is row 0: Name, Enrollment Number, Grade
            // Transform to object array
            const rows: GradeRow[] = [];

            // Skip header row
            for (let i = 1; i < jsonData.length; i++) {
                const row: any = jsonData[i];
                if (row.length === 0) continue;

                // Basic mapping based on user request format: Name, Enrollment number, Grade
                // Check if user provided header or just raw data. 
                // Let's assume standard format or explicit column mapping.
                // For robustness, let's look for column indices or just assume 0, 1, 2

                const name = row[0];
                const enrollmentNumber = row[1];
                const grade = row[2];

                if (name && enrollmentNumber && grade) {
                    rows.push({
                        name: String(name),
                        enrollmentNumber: String(enrollmentNumber),
                        grade: String(grade),
                        status: "PENDING"
                    });
                }
            }
            setParsedData(rows);
            setValidationReport([]);
        };
        reader.readAsBinaryString(file);
    };

    const handleSubmit = async () => {
        if (parsedData.length === 0) return;
        setUploading(true);

        try {
            const res = await fetch("/api/faculty/grades/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    offeringId,
                    grades: parsedData.map(r => ({
                        name: r.name,
                        enrollmentNumber: r.enrollmentNumber,
                        grade: r.grade
                    }))
                })
            });

            const result = await res.json();

            if (res.ok) {
                // Merge validation results
                const report = result.results;
                setValidationReport(report);

                // Update local status based on report
                const updatedData = parsedData.map(row => {
                    const statusRow = report.find((r: any) => r.enrollmentNumber === row.enrollmentNumber);
                    return {
                        ...row,
                        status: statusRow ? (statusRow.status === "SUCCESS" ? "Submitted" : "Invalid") : "Invalid",
                        message: statusRow?.message || "Unknown error"
                    };
                });
                setParsedData(updatedData);
            } else {
                alert(result.error || "Failed to upload grades");
            }

        } catch (error) {
            console.error("Upload error", error);
            alert("Failed to connect to server");
        } finally {
            setUploading(false);
        }
    };

    const validCount = validationReport.filter(r => r.status === "SUCCESS").length;
    const errorCount = validationReport.filter(r => r.status === "ERROR" || r.status === "WARNING").length;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Upload Grades</h1>
                        <p className="text-zinc-400 text-sm">Upload CSV/Excel file with: Name, Enrollment Number, Grade</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: Upload */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-zinc-900 rounded-xl border border-white/10 p-6">
                            <div
                                className="border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500/50 transition-colors cursor-pointer bg-zinc-900/50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv, .xlsx, .xls"
                                    onChange={handleFileChange}
                                />
                                <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <h3 className="font-medium mb-1">Click to upload file</h3>
                                <p className="text-xs text-zinc-500">CSV or Excel (.xlsx)</p>
                            </div>

                            {file && (
                                <div className="mt-4 flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-white/5">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                        <FileSpreadsheet className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button
                                        onClick={() => { setFile(null); setParsedData([]); setValidationReport([]); }}
                                        className="p-1 hover:bg-white/10 rounded"
                                    >
                                        <XCircle className="h-4 w-4 text-zinc-500" />
                                    </button>
                                </div>
                            )}

                            <div className="mt-6 flex gap-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!file || parsedData.length === 0 || uploading || (validationReport.length > 0 && errorCount === 0)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                >
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {validationReport.length > 0 ? "Retry / Re-upload" : "Submit Grades"}
                                </button>
                            </div>
                        </div>

                        {/* Formatting Instructions */}
                        <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-5 text-sm">
                            <h4 className="font-medium mb-3 flex items-center gap-2 text-zinc-300">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                Required Format
                            </h4>
                            <div className="space-y-2 text-zinc-400">
                                <p>Ensure your file has these columns in order (headers are skipped):</p>
                                <ol className="list-decimal list-inside space-y-1 ml-1 font-mono text-xs">
                                    <li>Student Name</li>
                                    <li>Enrollment Number (Roll No)</li>
                                    <li>Grade (A, A-, B, etc.)</li>
                                </ol>
                            </div>
                        </div>

                        {validationReport.length > 0 && (
                            <div className="bg-zinc-900 rounded-xl border border-white/10 p-5">
                                <h4 className="font-medium mb-4">Submission Summary</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                        <span className="text-emerald-400 text-sm">Successfully Updated</span>
                                        <span className="font-bold text-emerald-400">{validCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                                        <span className="text-red-400 text-sm">Errors / Mismatches</span>
                                        <span className="font-bold text-red-400">{errorCount}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Preview Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-zinc-900 rounded-xl border border-white/10 overflow-hidden h-[600px] flex flex-col">
                            <div className="p-4 border-b border-white/10 bg-zinc-900/50 flex justify-between items-center">
                                <h3 className="font-medium">Data Preview {parsedData.length > 0 && <span className="text-zinc-500">({parsedData.length} records)</span>}</h3>
                            </div>

                            <div className="flex-1 overflow-auto">
                                {parsedData.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-8">
                                        <FileSpreadsheet className="h-12 w-12 mb-4 opacity-20" />
                                        <p>No data loaded yet.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-zinc-800/50 text-zinc-400 sticky top-0 backdrop-blur-sm">
                                            <tr>
                                                <th className="py-3 px-4 font-medium">Roll Number</th>
                                                <th className="py-3 px-4 font-medium">Name</th>
                                                <th className="py-3 px-4 font-medium">Grade</th>
                                                <th className="py-3 px-4 font-medium w-40">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {parsedData.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-white/5">
                                                    <td className="py-2 px-4 font-mono text-zinc-300">{row.enrollmentNumber}</td>
                                                    <td className="py-2 px-4 text-zinc-300">{row.name}</td>
                                                    <td className="py-2 px-4 font-medium">{row.grade}</td>
                                                    <td className="py-2 px-4">
                                                        {row.status === "PENDING" && <span className="text-zinc-500 text-xs">Ready to submit</span>}
                                                        {row.status === "Submitted" && (
                                                            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs bg-emerald-500/10 px-2 py-1 rounded">
                                                                <CheckCircle className="h-3 w-3" /> Updated
                                                            </span>
                                                        )}
                                                        {row.status === "Invalid" && (
                                                            <div className="flex flex-col">
                                                                <span className="inline-flex items-center gap-1 text-red-400 text-xs bg-red-500/10 px-2 py-1 rounded w-fit mb-1">
                                                                    <XCircle className="h-3 w-3" /> Error
                                                                </span>
                                                                <span className="text-[10px] text-red-400/70">{row.message}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
