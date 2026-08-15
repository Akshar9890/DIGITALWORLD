import Link from "next/link";
import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 industrial-grid opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-[-10rem] -z-10 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary-container/10 blur-[120px]" />

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-6 flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-white">
              <Shield size={28} />
            </div>
          </Link>
          <h1 className="font-headline-lg text-on-surface">DigitalWorld</h1>
          <p className="mt-1 text-body-technical text-primary font-label-caps text-xs tracking-widest">
            INDUSTRIAL SAFETY
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
