import type React from "react";
import type { LucideIcon } from "lucide-react";
import { BrainCircuit, LogOut, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { clearAuthSession } from "@/lib/auth";

export type DashboardNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  disabled?: boolean;
};

type DashboardLayoutProps = {
  title: string;
  subtitle?: string;
  navItems: DashboardNavItem[];
  activeNavId: string;
  onNavChange?: (id: string) => void;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  signOutPath?: string;
  brandClassName?: string;
};

function SidebarNav({
  navItems,
  activeNavId,
  onNavChange,
  brandClassName,
  signOutPath,
  isMobile = false,
}: {
  navItems: DashboardNavItem[];
  activeNavId: string;
  onNavChange?: (id: string) => void;
  brandClassName: string;
  signOutPath: string;
  isMobile?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg",
            brandClassName,
          )}
        >
          <BrainCircuit className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold text-slate-900">EduRelief AI</span>
      </div>

      <nav className="flex-1 space-y-2" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeNavId === item.id;
          const classes = cn(
            "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-semibold transition-all duration-300",
            active
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
              : "text-slate-600 hover:bg-white/60 hover:text-indigo-700",
            item.disabled && "cursor-not-allowed opacity-50",
          );

          if (!item.path || item.disabled) {
            return (
              <button
                key={item.id}
                type="button"
                className={classes}
                onClick={() => onNavChange?.(item.id)}
                disabled={item.disabled}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className={classes}
              onClick={() => onNavChange?.(item.id)}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={cn("pt-6", !isMobile && "border-t border-slate-200") }>
        <Link
          to={signOutPath}
          onClick={clearAuthSession}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-red-500 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  title,
  subtitle,
  navItems,
  activeNavId,
  onNavChange,
  children,
  headerActions,
  signOutPath = "/",
  brandClassName = "bg-indigo-600",
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen gradient-bg flex">
      <aside className="glass hidden w-64 flex-col border-r border-white/20 p-6 md:flex">
        <SidebarNav
          navItems={navItems}
          activeNavId={activeNavId}
          onNavChange={onNavChange}
          signOutPath={signOutPath}
          brandClassName={brandClassName}
        />
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] border-r border-slate-200 bg-white/95 p-6">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>Main application menu</SheetDescription>
                </SheetHeader>
                <SidebarNav
                  navItems={navItems}
                  activeNavId={activeNavId}
                  onNavChange={onNavChange}
                  signOutPath={signOutPath}
                  brandClassName={brandClassName}
                  isMobile
                />
              </SheetContent>
            </Sheet>
            <div className="ml-1 md:ml-0">
              <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">{title}</h1>
              {subtitle ? <p className="text-slate-600">{subtitle}</p> : null}
            </div>
          </div>
          {headerActions ? <div className="flex items-center gap-2">{headerActions}</div> : null}
        </header>

        {children}
      </main>
    </div>
  );
}
