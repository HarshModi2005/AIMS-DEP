import { Navbar } from "@/components/layout/navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-950">
            <Navbar />
            <main className="pt-16">{children}</main>
        </div>
    );
}
