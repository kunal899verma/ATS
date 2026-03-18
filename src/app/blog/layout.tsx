import Navbar from "@/components/ui/Navbar";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020817]">
      <Navbar />
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      {children}
    </div>
  );
}
