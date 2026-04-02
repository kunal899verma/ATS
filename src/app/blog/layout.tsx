import Navbar from "@/components/ui/Navbar";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      {children}
    </div>
  );
}
