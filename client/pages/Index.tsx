import { useNavigate } from "react-router-dom";
import { UserCircle, Users, BookOpen, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { roleTheme } from "@/lib/theme";

const roles = [
  {
    id: "student",
    title: "Student",
    description: "Track your burnout, get AI tips, and stay balanced.",
    icon: UserCircle,
    gradient: roleTheme.student.gradient,
    path: "/login/student"
  },
  {
    id: "parent",
    title: "Parent",
    description: "Monitor your child's well-being and communicate with mentors.",
    icon: Users,
    gradient: roleTheme.parent.gradient,
    path: "/login/parent"
  },
  {
    id: "mentor",
    title: "Mentor",
    description: "Guide students at risk and analyze stress patterns.",
    icon: BookOpen,
    gradient: roleTheme.mentor.gradient,
    path: "/login/mentor"
  }
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden gradient-bg px-6 py-10 md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(14,165,233,0.14),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(79,70,229,0.18),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(56,189,248,0.10),transparent_40%)]" />
      <div className="relative mx-auto flex min-h-[85vh] w-full max-w-6xl flex-col justify-center space-y-10">
        <div className="space-y-4 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-white/70 p-3 shadow-sm backdrop-blur">
            <BrainCircuit className="mr-2 h-10 w-10 text-indigo-600" />
            <span className="bg-gradient-to-r from-indigo-700 to-cyan-600 bg-clip-text text-xl font-extrabold text-transparent">
              EduRelief AI
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
            Early Academic Burnout Detection
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-slate-600 md:text-xl">
            Harnessing behavioral AI to prevent student burnout before it starts.
            Who are you?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => navigate(role.path)}
              className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-8 text-left shadow-xl backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              aria-label={`Continue as ${role.title}`}
            >
              <div className={cn(
                "absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-15 transition-opacity group-hover:opacity-30",
                role.gradient
              )} />
              
              <div className={cn(
                "mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                role.gradient
              )}>
                <role.icon className="h-8 w-8" />
              </div>
              
              <h3 className="mb-2 text-2xl font-bold text-slate-800">{role.title}</h3>
              <p className="leading-relaxed text-slate-600">
                {role.description}
              </p>
              
              <div className="mt-6 flex items-center font-semibold text-indigo-700 transition-transform group-hover:translate-x-2">
                Get Started
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          Secure. Confidential. AI-Powered Mental Health Support.
        </p>
      </div>
    </div>
  );
}
