import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { 
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard, 
  Loader2,
  Settings, 
  Users, 
  TrendingUp, 
  Bell,
  MessageSquare,
  Shield,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DashboardLayout, { DashboardNavItem } from "@/components/layouts/DashboardLayout";
import { roleTheme } from "@/lib/theme";
import { ApiClientError, getRoleDashboard } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { RoleActionItem, RoleDashboardResponse } from "@shared/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACTIVE_TAB_KEY_PREFIX = "role-dashboard-active-tab";
const ACTIONS_KEY_PREFIX = "role-dashboard-actions";

type ActionStatusMap = Record<string, RoleActionItem["status"]>;

function loadActionStatusMap(role: "parent" | "mentor"): ActionStatusMap {
  try {
    const raw = localStorage.getItem(`${ACTIONS_KEY_PREFIX}:${role}`);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as ActionStatusMap;
  } catch {
    return {};
  }
}

function persistActionStatusMap(role: "parent" | "mentor", actions: RoleActionItem[]): void {
  const statusMap: ActionStatusMap = actions.reduce((acc, action) => {
    acc[action.id] = action.status;
    return acc;
  }, {} as ActionStatusMap);

  localStorage.setItem(`${ACTIONS_KEY_PREFIX}:${role}`, JSON.stringify(statusMap));
}

function persistActiveTab(role: "parent" | "mentor", tab: string): void {
  localStorage.setItem(`${ACTIVE_TAB_KEY_PREFIX}:${role}`, tab);
}

function loadActiveTab(role: "parent" | "mentor"): string | null {
  return localStorage.getItem(`${ACTIVE_TAB_KEY_PREFIX}:${role}`);
}

export default function DashboardPlaceholder() {
  const { toast } = useToast();
  const { role } = useParams();
  const roleTitle = role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";
  const normalizedRole = role === "parent" || role === "mentor" ? role : "student";
  const safeRole = role === "parent" || role === "mentor" ? role : "parent";
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<RoleDashboardResponse | null>(null);
  const [localActions, setLocalActions] = useState<RoleActionItem[]>([]);
  const [notifyByPush, setNotifyByPush] = useState(true);
  const [notifyByEmail, setNotifyByEmail] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState("daily");

  useEffect(() => {
    const savedTab = loadActiveTab(safeRole);
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [safeRole]);

  useEffect(() => {
    persistActiveTab(safeRole, activeTab);
  }, [activeTab, safeRole]);

  useEffect(() => {
    let mounted = true;

    getRoleDashboard(safeRole)
      .then((data) => {
        if (!mounted) {
          return;
        }

        const savedStatuses = loadActionStatusMap(safeRole);
        const mergedActions = data.actions.map((action) => {
          const savedStatus = savedStatuses[action.id];
          if (!savedStatus) {
            return action;
          }

          return {
            ...action,
            status: savedStatus,
          };
        });

        setDashboardData(data);
        setLocalActions(mergedActions);
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }

        const message =
          error instanceof ApiClientError
            ? error.message
            : "Could not load role dashboard workflow.";

        toast({
          title: "Dashboard unavailable",
          description: message,
          variant: "destructive",
        });
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [safeRole, toast]);

  useEffect(() => {
    if (localActions.length === 0) {
      return;
    }

    persistActionStatusMap(safeRole, localActions);
  }, [localActions, safeRole]);

  const getRoleTheme = () => {
    switch (role) {
      case "parent": return "bg-purple-600 shadow-purple-200";
      case "mentor": return "bg-emerald-600 shadow-emerald-200";
      default: return "bg-indigo-600 shadow-indigo-200";
    }
  };

  const navItems: DashboardNavItem[] = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "students", icon: Users, label: safeRole === "mentor" ? "My Students" : "Child Progress" },
    { id: "messages", icon: MessageSquare, label: "Messages" },
    { id: "analysis", icon: TrendingUp, label: "Detailed Reports" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const highRiskCount = useMemo(
    () => dashboardData?.students.filter((student) => student.riskLevel === "high").length ?? 0,
    [dashboardData],
  );

  const completedActions = localActions.filter((action) => action.status === "done").length;
  const pendingActions = localActions.filter((action) => action.status !== "done").length;

  const riskSummary = useMemo(() => {
    const summary = { high: 0, moderate: 0, low: 0 };

    for (const student of dashboardData?.students ?? []) {
      summary[student.riskLevel] += 1;
    }

    return summary;
  }, [dashboardData]);

  const topStudents = useMemo(
    () =>
      [...(dashboardData?.students ?? [])]
        .sort((a, b) => b.burnoutScore - a.burnoutScore)
        .slice(0, 2),
    [dashboardData],
  );

  const setActionStatus = (actionId: string, status: RoleActionItem["status"]) => {
    setLocalActions((prev) =>
      prev.map((action) =>
        action.id === actionId ? { ...action, status } : action,
      ),
    );

    toast({
      title: "Action updated",
      description: status === "done" ? "Workflow action marked as complete." : "Workflow action moved back to queue.",
    });
  };

  const quickControls =
    safeRole === "parent"
      ? [
          { id: "parent-checkin", label: "Schedule Family Check-in", detail: "Create a 20-minute low-pressure check-in tonight." },
          { id: "parent-routine", label: "Apply Sleep Routine", detail: "Share one wind-down action with your child." },
          { id: "parent-note", label: "Send Encouragement Message", detail: "Send a supportive message focused on wellbeing first." },
        ]
      : [
          { id: "mentor-intervention", label: "Start Intervention Workflow", detail: "Open high-risk student intervention protocol." },
          { id: "mentor-session", label: "Schedule Support Session", detail: "Set up a focused 1:1 wellbeing session." },
          { id: "mentor-report", label: "Share Progress Report", detail: "Send a concise trend report to guardians." },
        ];

  const templateMessages =
    safeRole === "parent"
      ? [
          "I noticed this week has been heavy. Want to plan one small reset tonight?",
          "No pressure to discuss grades right now, I just want to hear how you feel.",
        ]
      : [
          "You are not behind. Let’s focus on one manageable task for today.",
          "I can help you rebalance sleep and deadlines this week, starting with two small changes.",
        ];

  const getRiskBadgeClass = (level: "low" | "moderate" | "high") => {
    if (level === "high") {
      return "bg-red-100 text-red-700";
    }

    if (level === "moderate") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-emerald-100 text-emerald-700";
  };

  return (
    <DashboardLayout
      title={`${roleTitle} Workflow Dashboard`}
      subtitle={dashboardData?.summary ?? "Loading role-specific workflow..."}
      navItems={navItems}
      activeNavId={activeTab}
      onNavChange={setActiveTab}
      signOutPath="/"
      brandClassName={roleTheme[normalizedRole].solid}
      headerActions={
        <>
          <Button variant="ghost" size="icon" className="glass h-10 w-10 border-white/50">
            <Bell className="h-5 w-5 text-slate-600" />
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl glass border border-white/50">
            <Users className="h-5 w-5 text-slate-400" />
          </div>
        </>
      }
    >
      {loading ? (
        <div className="flex min-h-[65vh] items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/60 p-4 text-slate-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading {roleTitle} workflow...
          </div>
        </div>
      ) : !dashboardData ? (
        <div className="flex min-h-[65vh] items-center justify-center">
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-700">
            Dashboard data unavailable. Please try signing in again.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="space-y-6 lg:col-span-8">
            {activeTab === "overview" ? (
              <>
                <Card className="glass rounded-3xl border-transparent shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">{dashboardData.headline}</CardTitle>
                    <CardDescription>{dashboardData.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StatPill
                      icon={<Users className="h-4 w-4" />}
                      label="Students Monitored"
                      value={String(dashboardData.students.length)}
                    />
                    <StatPill
                      icon={<AlertTriangle className="h-4 w-4" />}
                      label="High-Risk Alerts"
                      value={String(highRiskCount)}
                    />
                    <StatPill
                      icon={<CheckCircle2 className="h-4 w-4" />}
                      label="Actions Completed"
                      value={`${completedActions}/${localActions.length}`}
                    />
                  </CardContent>
                </Card>

                <Card className="glass rounded-3xl border-transparent shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Priority Watchlist</CardTitle>
                    <CardDescription>Highest-risk students requiring follow-up this cycle.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topStudents.map((student) => (
                      <div key={student.studentId} className="rounded-2xl border border-white/50 bg-white/60 p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-800">{student.name}</p>
                          <span className={cn("rounded-full px-2 py-1 text-xs font-bold uppercase", getRiskBadgeClass(student.riskLevel))}>
                            {student.riskLevel}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          Burnout {student.burnoutScore}% · Stress {student.stressLevel}/10 · Sleep {student.sleepHours}h
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            ) : null}

            {activeTab === "students" ? (
              <Card className="glass rounded-3xl border-transparent shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Student Overview</CardTitle>
                  <CardDescription>Live workflow statuses for assigned students.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dashboardData.students.map((student) => (
                    <div key={student.studentId} className="rounded-2xl border border-white/50 bg-white/60 p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800">{student.name}</p>
                        <span className={cn("rounded-full px-2 py-1 text-xs font-bold uppercase", getRiskBadgeClass(student.riskLevel))}>
                          {student.riskLevel}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 md:grid-cols-4">
                        <p>Burnout: <strong>{student.burnoutScore}%</strong></p>
                        <p>Stress: <strong>{student.stressLevel}/10</strong></p>
                        <p>Sleep: <strong>{student.sleepHours}h</strong></p>
                        <p>Deadlines: <strong>{student.upcomingDeadlineCount}</strong></p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {activeTab === "messages" ? (
              <Card className="glass rounded-3xl border-transparent shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Message Templates</CardTitle>
                  <CardDescription>Use these templates for calm, constructive communication.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {templateMessages.map((template) => (
                    <div key={template} className="rounded-2xl border border-white/50 bg-white/60 p-4">
                      <p className="text-sm text-slate-700">{template}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => {
                          navigator.clipboard.writeText(template).catch(() => undefined);
                          toast({ title: "Template copied", description: "Message copied to clipboard." });
                        }}
                      >
                        Copy Message
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {activeTab === "analysis" ? (
              <Card className="glass rounded-3xl border-transparent shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Detailed Risk Analysis</CardTitle>
                  <CardDescription>Current cohort distribution and intervention pressure.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <StatPill icon={<AlertTriangle className="h-4 w-4" />} label="High Risk" value={String(riskSummary.high)} />
                  <StatPill icon={<TrendingUp className="h-4 w-4" />} label="Moderate Risk" value={String(riskSummary.moderate)} />
                  <StatPill icon={<Users className="h-4 w-4" />} label="Low Risk" value={String(riskSummary.low)} />
                  <StatPill icon={<CheckCircle2 className="h-4 w-4" />} label="Pending Actions" value={String(pendingActions)} />
                </CardContent>
              </Card>
            ) : null}

            {activeTab === "settings" ? (
              <Card className="glass rounded-3xl border-transparent shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Workflow Settings</CardTitle>
                  <CardDescription>Customize role alerts and dashboard digest behavior.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-white/50 bg-white/60 px-4 py-3">
                    <Label htmlFor="push-alerts" className="text-sm text-slate-700">Push alert notifications</Label>
                    <Switch id="push-alerts" checked={notifyByPush} onCheckedChange={setNotifyByPush} />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/50 bg-white/60 px-4 py-3">
                    <Label htmlFor="email-alerts" className="text-sm text-slate-700">Email escalation summaries</Label>
                    <Switch id="email-alerts" checked={notifyByEmail} onCheckedChange={setNotifyByEmail} />
                  </div>
                  <div className="rounded-xl border border-white/50 bg-white/60 px-4 py-3">
                    <Label className="mb-2 block text-sm text-slate-700">Digest frequency</Label>
                    <Select value={digestFrequency} onValueChange={setDigestFrequency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select digest interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily digest</SelectItem>
                        <SelectItem value="weekly">Weekly digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {activeTab !== "messages" && activeTab !== "settings" ? (
              <Card className="glass rounded-3xl border-transparent shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Alerts and Workflow Queue</CardTitle>
                  <CardDescription>Priority actions for seamless intervention flow.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {localActions.map((action) => (
                    <div key={action.id} className="rounded-2xl border border-white/50 bg-white/60 p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800">{action.title}</p>
                        <span className={cn(
                          "rounded-full px-2 py-1 text-[10px] font-bold uppercase",
                          action.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : action.priority === "medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700",
                        )}>
                          {action.priority}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{action.description}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className={cn(
                          "text-xs font-semibold uppercase",
                          action.status === "done"
                            ? "text-emerald-600"
                            : action.status === "in_progress"
                              ? "text-indigo-600"
                              : "text-slate-500",
                        )}>
                          {action.status.replace("_", " ")}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setActionStatus(action.id, action.status === "done" ? "pending" : "done")}
                        >
                          {action.status === "done" ? "Reopen" : "Mark Complete"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </section>

          <aside className="space-y-6 lg:col-span-4">
            <Card className="glass rounded-3xl border-transparent shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Active Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dashboardData.alerts.map((alert) => (
                  <div key={alert} className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
                    {alert}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass rounded-3xl border-transparent shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Quick Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickControls.map((control, index) => (
                  <Button
                    key={control.id}
                    type="button"
                    variant={index === 0 ? "default" : "outline"}
                    className={cn("w-full justify-start", index === 0 && getRoleTheme())}
                    onClick={() =>
                      toast({
                        title: control.label,
                        description: control.detail,
                      })
                    }
                  >
                    {index === 0 ? <Shield className="mr-2 h-4 w-4" /> : index === 1 ? <Clock3 className="mr-2 h-4 w-4" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                    {control.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-600">{icon}</div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-extrabold text-slate-800">{value}</p>
    </div>
  );
}
