import type React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BrainCircuit } from "lucide-react";

type CenteredAuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function CenteredAuthLayout({
  title,
  subtitle,
  children,
}: CenteredAuthLayoutProps) {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.14),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.10),transparent_45%)]" />

      <Link
        to="/"
        className="absolute left-6 top-6 z-10 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur hover:bg-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8">
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
            <BrainCircuit className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-extrabold text-slate-900">EduRelief AI</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">{title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 md:text-lg">{subtitle}</p>
        </div>

        <div className="w-full max-w-2xl rounded-3xl border border-white/40 bg-white/70 p-6 shadow-2xl backdrop-blur md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
