import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home, LayoutDashboard, MessageSquare } from "lucide-react";
import CenteredAuthLayout from "@/components/layouts/CenteredAuthLayout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <CenteredAuthLayout
      title="Page Not Found"
      subtitle="The route you requested does not exist yet. Use one of the quick actions below to continue."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <AlertTriangle className="h-8 w-8" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide">404 Route Missing</p>
            <p className="text-sm text-amber-800">{location.pathname}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button asChild className="h-12 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-12 rounded-xl border-slate-300 bg-white/80">
            <Link to="/student/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Student Dashboard
            </Link>
          </Button>
        </div>

        <Button asChild variant="ghost" className="h-11 w-full rounded-xl text-slate-700 hover:bg-slate-100">
          <Link to="/chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            Open AI Assistant
          </Link>
        </Button>
      </div>
    </CenteredAuthLayout>
  );
};

export default NotFound;
