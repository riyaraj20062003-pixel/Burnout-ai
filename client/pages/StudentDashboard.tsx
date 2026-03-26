import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BellRing,
  BookOpen,
  BrainCircuit,
  Calendar,
  ChevronRight,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Monitor,
  Moon,
  Pause,
  PhoneCall,
  Play,
  ShieldAlert,
  Smile,
  TimerReset,
  TrendingUp,
  UserCircle,
  Volume2,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardLayout, { DashboardNavItem } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type {
  BurnoutTrendPoint,
  DeadlineItem,
  MentorContact,
  ResourceTool,
  SmartInsightsResponse,
} from "@shared/api";
import {
  ApiClientError,
  createDeadline,
  deleteDeadline,
  generateSmartInsights,
  getBurnoutHistory,
  getBurnoutTrends,
  getDeadlines,
  getSupportResources,
  predictBurnout,
} from "@/lib/api";
import {
  loadAlertPreferences,
  playSeverityAlert,
  saveAlertPreferences,
} from "@/lib/audio-alerts";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type RiskLevel = "low" | "moderate" | "high";

type PredictionState = {
  score: number;
  level: RiskLevel;
  recommendations: string[];
  insights: string;
};

export default function StudentDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [historyData, setHistoryData] = useState<{ day: string; score: number }[]>([]);
  const [trendData, setTrendData] = useState<BurnoutTrendPoint[]>([]);
  const [lastTrendRefreshAt, setLastTrendRefreshAt] = useState<string>("");
  const [resourceTools, setResourceTools] = useState<ResourceTool[]>([]);
  const [mentorContact, setMentorContact] = useState<MentorContact | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionState | null>(null);
  const [breathingSeconds, setBreathingSeconds] = useState(0);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [alertVolume, setAlertVolume] = useState(0.6);
  const [highRiskAcknowledged, setHighRiskAcknowledged] = useState(true);
  const [recoveryChecklist, setRecoveryChecklist] = useState([false, false, false]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [deadlineSubject, setDeadlineSubject] = useState("");
  const [deadlineDueAt, setDeadlineDueAt] = useState("");
  const [smartInsights, setSmartInsights] = useState<SmartInsightsResponse | null>(null);
  const [loadingDeadlines, setLoadingDeadlines] = useState(true);
  const [submittingDeadline, setSubmittingDeadline] = useState(false);

  const [sleep, setSleep] = useState(7);
  const [study, setStudy] = useState(5);
  const [stress, setStress] = useState(5);
  const [load, setLoad] = useState(3);
  const [mood, setMood] = useState("Neutral");
  const [social, setSocial] = useState(3);
  const [screen, setScreen] = useState(6);
  const [motivation, setMotivation] = useState(5);
  const [previewScore, setPreviewScore] = useState(34);

  const navItems: DashboardNavItem[] = [
    { id: "overview", icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard" },
    { id: "analysis", icon: TrendingUp, label: "Trend Analysis", path: "/student/dashboard" },
    { id: "chat", icon: MessageSquare, label: "AI Chat Assistant", path: "/chat" },
    { id: "resources", icon: BookOpen, label: "Resources", path: "/student/dashboard" },
  ];

  useEffect(() => {
    let mounted = true;

    getBurnoutHistory()
      .then((data) => {
        if (mounted) {
          setHistoryData(data);
        }
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }

        const message =
          error instanceof ApiClientError ? error.message : "Could not load your trend history.";

        toast({
          title: "History unavailable",
          description: message,
          variant: "destructive",
        });
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  useEffect(() => {
    let mounted = true;

    const fetchTrends = async () => {
      try {
        const data = await getBurnoutTrends();
        if (mounted) {
          setTrendData(data);
          setLastTrendRefreshAt(
            new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          );
        }
      } catch {
        // Keep polling resilient without noisy toasts.
      }
    };

    void fetchTrends();
    const timer = window.setInterval(() => {
      void fetchTrends();
    }, 10000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPreviewScore(
        estimateBurnoutScore({
          sleepHours: sleep,
          studyHours: study,
          stressLevel: stress,
          assignmentLoad: load,
          socialActivity: social,
          screenTime: screen,
          motivationLevel: motivation,
        }),
      );
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [sleep, study, stress, load, social, screen, motivation]);

  useEffect(() => {
    let mounted = true;

    getDeadlines()
      .then((items) => {
        if (mounted) {
          setDeadlines(items);
        }
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }

        const message =
          error instanceof ApiClientError ? error.message : "Could not load deadlines.";
        toast({
          title: "Deadline system unavailable",
          description: message,
          variant: "destructive",
        });
      })
      .finally(() => {
        if (mounted) {
          setLoadingDeadlines(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  useEffect(() => {
    const prefs = loadAlertPreferences();
    setAudioEnabled(prefs.enabled);
    setVoiceEnabled(prefs.voiceEnabled);
    setAlertVolume(prefs.volume);
  }, []);

  useEffect(() => {
    saveAlertPreferences({
      enabled: audioEnabled,
      voiceEnabled,
      volume: alertVolume,
    });
  }, [audioEnabled, voiceEnabled, alertVolume]);

  useEffect(() => {
    let mounted = true;

    getSupportResources()
      .then((data) => {
        if (!mounted) {
          return;
        }

        setResourceTools(data.tools);
        setMentorContact(data.mentorContact);

        const studyTool = data.tools.find((tool) => tool.category === "study");
        if (studyTool?.durationMinutes) {
          setPomodoroSeconds(studyTool.durationMinutes * 60);
        }
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }

        const message =
          error instanceof ApiClientError ? error.message : "Could not load support resources.";

        toast({
          title: "Resources unavailable",
          description: message,
          variant: "destructive",
        });
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  useEffect(() => {
    if (breathingSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setBreathingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [breathingSeconds]);

  useEffect(() => {
    if (!isPomodoroRunning || pomodoroSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setPomodoroSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPomodoroRunning, pomodoroSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = await predictBurnout({
        sleep_hours: sleep,
        study_hours: study,
        stress_level: stress,
        assignment_load: load,
        mood,
        social_activity: social,
        screen_time: screen,
        motivation_level: motivation,
      });

      setPrediction({
        score: data.burnout_score,
        level: data.risk_level,
        recommendations: data.recommendations,
        insights: data.insights,
      });

      const insightPayload = await generateSmartInsights({
        sleepHours: sleep,
        stressLevel: stress,
        screenTime: screen,
        burnoutScore: data.burnout_score,
      });
      setSmartInsights(insightPayload);

      if (data.risk_level === "high") {
        setHighRiskAcknowledged(false);
        setRecoveryChecklist([false, false, false]);
      } else {
        setHighRiskAcknowledged(true);
      }

      void playSeverityAlert(data.risk_level, {
        enabled: audioEnabled,
        voiceEnabled,
        volume: alertVolume,
      });

      toast({
        title: "Assessment complete",
        description: "Your burnout analysis has been generated.",
      });
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Could not generate your burnout prediction right now.";

      toast({
        title: "Assessment failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const riskMeta = useMemo(() => {
    if (!prediction) {
      return { chip: "bg-slate-100 text-slate-700", accent: "text-slate-700" };
    }

    if (prediction.level === "high") {
      return { chip: "bg-high/10 text-high", accent: "text-high" };
    }

    if (prediction.level === "moderate") {
      return { chip: "bg-moderate/10 text-moderate", accent: "text-moderate" };
    }

    return { chip: "bg-low/10 text-low", accent: "text-low" };
  }, [prediction]);

  const breathingTool = resourceTools.find((tool) => tool.category === "stress");
  const sleepTool = resourceTools.find((tool) => tool.category === "sleep");
  const studyTool = resourceTools.find((tool) => tool.category === "study");
  const mentalSupportTool = resourceTools.find((tool) => tool.category === "mental_support");

  const breathingLabel =
    breathingSeconds > 0
      ? `Breathing in progress · ${formatSeconds(breathingSeconds)}`
      : breathingTool
        ? `Ready · ${breathingTool.durationMinutes ?? 3} minute cycle`
        : "Prepare breathing reset";

  const pomodoroLabel = `Pomodoro · ${formatSeconds(pomodoroSeconds)}`;

  const startBreathing = () => {
    const duration = (breathingTool?.durationMinutes ?? 3) * 60;
    setBreathingSeconds(duration);

    toast({
      title: "Breathing session started",
      description: "Follow the guided rhythm: inhale 4, hold 4, exhale 6.",
    });
  };

  const showSleepRecommendations = () => {
    if (!sleepTool) {
      return;
    }

    toast({
      title: sleepTool.title,
      description: sleepTool.steps[0],
    });
  };

  const togglePomodoro = () => {
    setIsPomodoroRunning((prev) => !prev);
  };

  const resetPomodoro = () => {
    setPomodoroSeconds((studyTool?.durationMinutes ?? 25) * 60);
    setIsPomodoroRunning(false);
  };

  const contactMentor = () => {
    if (!mentorContact) {
      return;
    }

    toast({
      title: "Mentor contact initiated",
      description: `${mentorContact.name} typically responds in about ${mentorContact.responseEtaMinutes} minutes.`,
    });
  };

  const allRecoveryStepsChecked = recoveryChecklist.every(Boolean);
  const previewLevel: RiskLevel = previewScore > 75 ? "high" : previewScore > 45 ? "moderate" : "low";

  const toggleRecoveryStep = (index: number, checked: boolean) => {
    setRecoveryChecklist((prev) => {
      const next = [...prev];
      next[index] = checked;
      return next;
    });
  };

  const handleAddDeadline = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deadlineSubject.trim() || !deadlineDueAt) {
      toast({
        title: "Missing deadline details",
        description: "Add both subject and due time.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingDeadline(true);
    try {
      const created = await createDeadline({
        subject: deadlineSubject.trim(),
        dueAt: new Date(deadlineDueAt).toISOString(),
      });

      setDeadlines((prev) =>
        [...prev, created].sort(
          (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
        ),
      );
      setDeadlineSubject("");
      setDeadlineDueAt("");

      toast({
        title: "Deadline added",
        description: `${created.subject} has been scheduled.`,
      });
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : "Could not add deadline.";

      toast({
        title: "Deadline save failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmittingDeadline(false);
    }
  };

  const handleDeleteDeadline = async (deadlineId: string) => {
    try {
      await deleteDeadline(deadlineId);
      setDeadlines((prev) => prev.filter((item) => item.id !== deadlineId));
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : "Could not remove deadline.";

      toast({
        title: "Delete failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout
      title="Welcome back, Alex"
      subtitle="Track your well-being and maintain academic balance."
      navItems={navItems}
      activeNavId={activeTab}
      onNavChange={setActiveTab}
      signOutPath="/"
      headerActions={
        <>
          <div className="hidden items-center rounded-2xl border border-white/40 bg-white/60 px-3 py-2 text-sm font-semibold text-slate-700 md:flex">
            <Calendar className="mr-2 h-4 w-4 text-indigo-600" />
            Monday, May 15
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl glass border border-white/50">
            <UserCircle className="h-7 w-7 text-slate-400" />
          </div>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-8">
          {!prediction ? (
            <Card className="glass overflow-hidden rounded-3xl border-transparent shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-600/5 to-cyan-500/10 pb-4">
                <div className="mb-2 flex items-center gap-3">
                  <Activity className="h-6 w-6 text-indigo-600" />
                  <CardTitle className="text-2xl font-bold">Daily Well-being Check</CardTitle>
                </div>
                <CardDescription>
                  Share your current habits and mood for an AI-powered burnout risk assessment.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                      <MetricSlider label="Sleep Hours" valueLabel={`${sleep} hrs`} value={sleep} min={0} max={12} step={0.5} onChange={setSleep} icon={<Moon className="h-4 w-4 text-indigo-500" />} />
                      <MetricSlider label="Study Hours" valueLabel={`${study} hrs`} value={study} min={0} max={15} step={1} onChange={setStudy} icon={<BookOpen className="h-4 w-4 text-sky-500" />} />
                      <MetricSlider label="Stress Level" valueLabel={`${stress}/10`} value={stress} min={0} max={10} step={1} onChange={setStress} icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} />
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 font-bold text-slate-700">
                          <Smile className="h-4 w-4 text-pink-500" />
                          Current Mood
                        </Label>
                        <Select value={mood} onValueChange={setMood}>
                          <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/60">
                            <SelectValue placeholder="How is your mood today?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Excellent">Excellent</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Neutral">Neutral</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Very Low">Very Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <MetricSlider label="Assignment Load" valueLabel={`${load}/10`} value={load} min={0} max={10} step={1} onChange={setLoad} icon={<Activity className="h-4 w-4 text-emerald-500" />} />
                      <MetricSlider label="Social Activity" valueLabel={`${social}/10`} value={social} min={0} max={10} step={1} onChange={setSocial} icon={<Heart className="h-4 w-4 text-rose-500" />} />
                      <MetricSlider label="Screen Time" valueLabel={`${screen} hrs`} value={screen} min={0} max={16} step={1} onChange={setScreen} icon={<Monitor className="h-4 w-4 text-slate-500" />} />
                      <MetricSlider label="Motivation" valueLabel={`${motivation}/10`} value={motivation} min={0} max={10} step={1} onChange={setMotivation} icon={<BrainCircuit className="h-4 w-4 text-violet-500" />} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                      Live Predicted Burnout
                    </p>
                    <p className="mt-1 text-3xl font-extrabold text-indigo-700">{previewScore}%</p>
                    <p className="text-sm text-indigo-700">
                      Risk: <span className="font-semibold uppercase">{previewLevel}</span>
                    </p>
                    <Progress value={previewScore} className="mt-3 h-3 bg-indigo-100" />
                    <p className="mt-2 text-xs text-indigo-600">
                      Adjust sleep and stress sliders to see real-time impact before submit.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="h-14 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-base font-bold text-white hover:from-indigo-700 hover:to-cyan-600"
                    disabled={submitting}
                  >
                    {submitting ? "Analyzing your pattern..." : "Generate Burnout Risk Prediction"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass overflow-hidden rounded-3xl border-transparent shadow-xl">
              <CardHeader className="pb-2 pt-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className={cn("flex h-24 w-24 items-center justify-center rounded-full font-extrabold text-4xl", riskMeta.chip)}>
                    {prediction.score}
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold">Burnout Analysis Result</CardTitle>
                <CardDescription>
                  Risk Level: <span className={cn("font-bold uppercase", riskMeta.accent)}>{prediction.level}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
                    <span>Burnout Score</span>
                    <span>{prediction.score}%</span>
                  </div>
                  <Progress value={prediction.score} className="h-4 bg-slate-100" />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 font-bold text-slate-900">AI Insight</h4>
                    <p className="rounded-2xl border border-white/40 bg-white/50 p-4 text-sm text-slate-700">
                      {prediction.insights}
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-3 font-bold text-slate-900">Recommendations</h4>
                    <ul className="space-y-2">
                      {prediction.recommendations.map((recommendation) => (
                        <li key={recommendation} className="flex items-start rounded-lg bg-white/30 p-2 text-sm text-slate-700">
                          <ChevronRight className="mr-2 mt-0.5 h-4 w-4 text-indigo-500" />
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {prediction.level === "high" ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4" role="alert" aria-live="assertive">
                    <div className="mb-3 flex items-center gap-2 text-red-700">
                      <ShieldAlert className="h-5 w-5" />
                      <p className="font-bold">High-Risk Red Alert</p>
                    </div>
                    <p className="mb-4 text-sm text-red-700">
                      Immediate recovery actions are required before continuing.
                    </p>

                    <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                      <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={startBreathing}>
                        Start Breathing Exercise
                      </Button>
                      <Button type="button" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" onClick={contactMentor}>
                        Contact Mentor Now
                      </Button>
                    </div>

                    <div className="space-y-2 rounded-xl border border-red-100 bg-white p-3">
                      <p className="text-sm font-semibold text-slate-700">Recovery checklist</p>
                      {[
                        "I have completed one breathing reset.",
                        "I have contacted or prepared to contact mentor support.",
                        "I committed to reducing workload for the next 24 hours.",
                      ].map((item, index) => (
                        <label key={item} className="flex items-start gap-2 text-sm text-slate-700">
                          <Checkbox
                            checked={recoveryChecklist[index]}
                            onCheckedChange={(value) => toggleRecoveryStep(index, value === true)}
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>

                    <Button
                      type="button"
                      className="mt-4 w-full bg-red-700 text-white hover:bg-red-800"
                      disabled={!allRecoveryStepsChecked}
                      onClick={() => setHighRiskAcknowledged(true)}
                    >
                      Acknowledge Red Alert
                    </Button>
                  </div>
                ) : null}

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl"
                  disabled={prediction.level === "high" && !highRiskAcknowledged}
                  onClick={() => setPrediction(null)}
                >
                  Start New Assessment
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="glass rounded-3xl border-transparent shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Real-Time Wellness Trends</CardTitle>
              <CardDescription>
                Burnout, stress, and sleep trends update every 10 seconds.
                {lastTrendRefreshAt ? ` Last refresh at ${lastTrendRefreshAt}.` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pt-2" aria-live="polite">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData.length > 0 ? trendData : historyData.map((point) => ({
                  label: point.day,
                  burnout: point.score,
                  stress: Math.max(1, Math.min(10, Math.round(point.score / 12))),
                  sleep: Math.max(4, Math.min(9, Number((8 - point.score / 40).toFixed(1)))),
                }))}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Area
                    dataKey="burnout"
                    name="Burnout"
                    type="monotone"
                    stroke="#4f46e5"
                    fill="url(#scoreGradient)"
                    strokeWidth={3}
                  />
                  <Line
                    dataKey="stress"
                    name="Stress"
                    type="monotone"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="sleep"
                    name="Sleep"
                    type="monotone"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6 lg:col-span-4">
          <Card className="glass rounded-3xl border-transparent shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Deadline System</CardTitle>
              <CardDescription>Add subject deadlines and track upcoming/missed status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddDeadline} className="space-y-2">
                <Label htmlFor="deadline-subject" className="sr-only">Deadline subject</Label>
                <Input
                  id="deadline-subject"
                  placeholder="Subject name"
                  value={deadlineSubject}
                  onChange={(e) => setDeadlineSubject(e.target.value)}
                  className="bg-white/70"
                />
                <Label htmlFor="deadline-due-at" className="sr-only">Deadline due date and time</Label>
                <Input
                  id="deadline-due-at"
                  type="datetime-local"
                  value={deadlineDueAt}
                  onChange={(e) => setDeadlineDueAt(e.target.value)}
                  className="bg-white/70"
                />
                <Button type="submit" className="w-full" disabled={submittingDeadline}>
                  {submittingDeadline ? "Saving..." : "Add Deadline"}
                </Button>
              </form>

              <div className="space-y-2">
                {loadingDeadlines ? (
                  <p className="text-sm text-slate-500">Loading deadlines...</p>
                ) : deadlines.length === 0 ? (
                  <p className="text-sm text-slate-500">No deadlines yet.</p>
                ) : (
                  deadlines.map((item) => (
                    <div key={item.id} className="rounded-xl border border-white/60 bg-white/60 p-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">{item.subject}</p>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            item.status === "missed"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700",
                          )}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Due {new Date(item.dueAt).toLocaleString()}
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteDeadline(item.id)}
                        aria-label={`Remove deadline ${item.subject}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass rounded-3xl border-transparent shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Smart Insights</CardTitle>
              <CardDescription>Behavior signals translated into clear next steps.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {smartInsights ? (
                <>
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm font-semibold text-indigo-700">
                    {smartInsights.primaryInsight}
                  </div>
                  <ul className="space-y-2">
                    {smartInsights.insights.map((item) => (
                      <li key={item} className="text-sm text-slate-700">
                        - {item}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  Generate an assessment to see insights like "low sleep causing stress" and "screen time too high".
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="glass rounded-3xl border-transparent shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatCard title="Sleep" value="7.5 Hours" trend="+12%" icon={<Moon className="h-5 w-5" />} accent="bg-indigo-500" />
              <StatCard title="Study" value="5.2 Hours" trend="-5%" icon={<BookOpen className="h-5 w-5" />} accent="bg-cyan-500" />
              <StatCard title="Stress" value="Low (3/10)" trend="Stable" icon={<Activity className="h-5 w-5" />} accent="bg-emerald-500" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-3xl border-transparent bg-gradient-to-br from-indigo-600 to-cyan-600 text-white shadow-xl">
            <div className="absolute right-0 top-0 p-4 opacity-20">
              <BrainCircuit className="h-24 w-24" />
            </div>
            <CardHeader className="relative">
              <CardTitle className="text-xl font-bold">Resources and Support</CardTitle>
              <CardDescription className="text-cyan-50">
                Use targeted tools for stress, sleep, study rhythm, and mentor support.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <div className="rounded-2xl bg-white/20 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <BellRing className="h-4 w-4" />
                  Voice and Sound Alerts
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label htmlFor="audio-enabled" className="text-white">Enable alert tones</Label>
                    <Switch
                      id="audio-enabled"
                      checked={audioEnabled}
                      onCheckedChange={setAudioEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Label htmlFor="voice-enabled" className="text-white">Enable voice prompts</Label>
                    <Switch
                      id="voice-enabled"
                      checked={voiceEnabled}
                      onCheckedChange={setVoiceEnabled}
                      disabled={!audioEnabled}
                    />
                  </div>
                  <div className="pt-1">
                    <Label className="mb-2 flex items-center gap-2 text-xs text-cyan-100">
                      <Volume2 className="h-3 w-3" />
                      Alert Volume
                    </Label>
                    <Slider
                      value={[alertVolume]}
                      min={0.05}
                      max={1}
                      step={0.05}
                      onValueChange={(value) => setAlertVolume(value[0] ?? 0.6)}
                      disabled={!audioEnabled}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={startBreathing}
                className="w-full rounded-2xl bg-white/20 p-3 text-left transition hover:bg-white/30"
              >
                <p className="text-sm font-bold">{breathingTool?.title ?? "Breathing Tool"}</p>
                <p className="text-xs text-cyan-100">{breathingLabel}</p>
              </button>

              <button
                type="button"
                onClick={showSleepRecommendations}
                className="w-full rounded-2xl bg-white/20 p-3 text-left transition hover:bg-white/30"
              >
                <p className="text-sm font-bold">{sleepTool?.title ?? "Sleep Recommendations"}</p>
                <p className="text-xs text-cyan-100">Open your personalized wind-down plan</p>
              </button>

              <div className="rounded-2xl bg-white/20 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold">{studyTool?.title ?? "Pomodoro Timer"}</p>
                  <p className="text-xs font-semibold text-cyan-100">{pomodoroLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" className="h-9 flex-1" onClick={togglePomodoro}>
                    {isPomodoroRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {isPomodoroRunning ? "Pause" : "Start"}
                  </Button>
                  <Button type="button" variant="outline" className="h-9 border-white/50 bg-transparent text-white hover:bg-white/20" onClick={resetPomodoro}>
                    <TimerReset className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <button
                type="button"
                onClick={contactMentor}
                className="w-full rounded-2xl bg-white p-3 text-left text-indigo-700 transition hover:bg-white/90"
              >
                <p className="flex items-center text-sm font-bold">
                  <PhoneCall className="mr-2 h-4 w-4" />
                  {mentalSupportTool?.title ?? "Contact Mentor"}
                </p>
                <p className="text-xs text-indigo-600">
                  {mentorContact
                    ? `${mentorContact.name} · ${mentorContact.availability}`
                    : "Mentor support availability will appear here."}
                </p>
              </button>

              <Link to="/chat" className="inline-flex w-full">
                <Button className="h-11 w-full rounded-xl bg-white font-bold text-indigo-700 hover:bg-white/90">
                  Open Lisa Chat
                </Button>
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </DashboardLayout>
  );
}

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function estimateBurnoutScore(input: {
  sleepHours: number;
  studyHours: number;
  stressLevel: number;
  assignmentLoad: number;
  socialActivity: number;
  screenTime: number;
  motivationLevel: number;
}): number {
  let score = 0;
  score += (10 - input.sleepHours) * 4;
  score += (input.studyHours / 2) * 5;
  score += input.stressLevel * 3.5;
  score += input.assignmentLoad * 2.5;
  score -= input.socialActivity * 2;
  score += input.screenTime * 1.5;
  score -= input.motivationLevel * 3;

  return Math.max(5, Math.min(98, Math.round(score)));
}

function MetricSlider({
  label,
  value,
  valueLabel,
  min,
  max,
  step,
  onChange,
  icon,
}: {
  label: string;
  value: number;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 font-bold text-slate-700">
          {icon}
          {label}
        </Label>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
          {valueLabel}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(next) => onChange(next[0] ?? min)}
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  trend,
  icon,
  accent,
}: {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/50 bg-white/40 p-4">
      <div className="flex items-center gap-3">
        <div className={cn("rounded-lg p-2 text-white", accent)}>{icon}</div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="text-lg font-bold text-slate-800">{value}</p>
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-500">{trend}</span>
    </div>
  );
}
