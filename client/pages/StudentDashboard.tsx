import { useState, useMemo } from "react";
import { 
  Activity, 
  BrainCircuit, 
  Clock, 
  LayoutDashboard, 
  MessageSquare, 
  Moon, 
  Smile, 
  TrendingUp, 
  UserCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  Settings,
  LogOut,
  ChevronRight,
  BookOpen,
  Monitor,
  Heart
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Mock data for burnout history
const historyData = [
  { day: "Mon", score: 25 },
  { day: "Tue", score: 30 },
  { day: "Wed", score: 45 },
  { day: "Thu", score: 55 },
  { day: "Fri", score: 40 },
  { day: "Sat", score: 35 },
  { day: "Sun", score: 20 },
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [formStep, setFormStep] = useState(1);
  const [prediction, setPrediction] = useState<{ score: number; level: "low" | "moderate" | "high" } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [sleep, setSleep] = useState(7);
  const [study, setStudy] = useState(5);
  const [stress, setStress] = useState(5);
  const [load, setLoad] = useState(3);
  const [mood, setMood] = useState("Neutral");
  const [social, setSocial] = useState(3);
  const [screen, setScreen] = useState(6);
  const [motivation, setMotivation] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/burnout/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sleep_hours: sleep,
          study_hours: study,
          stress_level: stress,
          assignment_load: load,
          mood: mood,
          social_activity: social,
          screen_time: screen,
          motivation_level: motivation
        })
      });

      const data = await response.json();
      setPrediction({
        score: data.burnout_score,
        level: data.risk_level as "low" | "moderate" | "high"
      });
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "text-high bg-high/10";
      case "moderate": return "text-moderate bg-moderate/10";
      default: return "text-low bg-low/10";
    }
  };

  const getRecommendations = (score: number) => {
    if (score > 70) return [
      "Schedule a 1-on-1 session with your mentor",
      "Take a complete study break for 24 hours",
      "Focus on getting 8+ hours of sleep tonight",
      "Try a 10-minute guided meditation"
    ];
    if (score > 40) return [
      "Review your upcoming deadline priorities",
      "Limit non-essential screen time",
      "Spend an hour outdoors today",
      "Check in with a friend"
    ];
    return [
      "Keep up the great balance!",
      "Plan a fun activity for the weekend",
      "Maintain your current sleep schedule"
    ];
  };

  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/20 hidden md:flex flex-col p-6 space-y-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-900">EduRelief AI</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: "overview", icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard" },
            { id: "analysis", icon: TrendingUp, label: "Trend Analysis", path: "/student/dashboard" },
            { id: "chat", icon: MessageSquare, label: "AI Chat Assistant", path: "/chat" },
            { id: "resources", icon: BookOpen, label: "Resources", path: "/student/dashboard" },
            { id: "settings", icon: Settings, label: "Settings", path: "/student/dashboard" },
          ].map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300",
                activeTab === item.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "text-slate-600 hover:bg-white/50 hover:text-indigo-600"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-200">
          <Link to="/" className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-colors font-semibold">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Welcome back, Alex</h1>
            <p className="text-slate-600">Track your well-being and maintain academic balance.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/30 shadow-sm">
              <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
              <span className="text-slate-700 font-medium">Monday, May 15</span>
            </div>
            <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center border border-white/50 shadow-sm">
              <UserCircle className="w-8 h-8 text-slate-400" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Burnout Form / Prediction Result */}
          <div className="lg:col-span-8 space-y-6">
            {!prediction ? (
              <Card className="glass border-transparent shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-indigo-600/5 to-purple-600/5">
                  <div className="flex items-center space-x-3 mb-2">
                    <Activity className="w-6 h-6 text-indigo-600" />
                    <CardTitle className="text-2xl font-bold">Daily Well-being Check</CardTitle>
                  </div>
                  <CardDescription>Tell us how you're feeling today to get your AI-powered burnout risk score.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="flex items-center font-bold text-slate-700">
                              <Moon className="w-4 h-4 mr-2 text-blue-500" />
                              Sleep Hours
                            </Label>
                            <span className="text-sm font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">{sleep} hrs</span>
                          </div>
                          <Slider 
                            value={[sleep]} 
                            max={12} 
                            min={0} 
                            step={0.5} 
                            onValueChange={(val) => setSleep(val[0])}
                            className="py-2"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="flex items-center font-bold text-slate-700">
                              <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                              Study Hours
                            </Label>
                            <span className="text-sm font-bold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">{study} hrs</span>
                          </div>
                          <Slider 
                            value={[study]} 
                            max={15} 
                            min={0} 
                            step={1} 
                            onValueChange={(val) => setStudy(val[0])}
                            className="py-2"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="flex items-center font-bold text-slate-700">
                              <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                              Stress Level (1-10)
                            </Label>
                            <span className="text-sm font-bold bg-amber-100 text-amber-600 px-3 py-1 rounded-full">{stress}/10</span>
                          </div>
                          <Slider 
                            value={[stress]} 
                            max={10} 
                            min={1} 
                            step={1} 
                            onValueChange={(val) => setStress(val[0])}
                            className="py-2"
                          />
                        </div>

                        <div className="space-y-4">
                          <Label className="flex items-center font-bold text-slate-700 mb-2">
                            <Smile className="w-4 h-4 mr-2 text-pink-500" />
                            Current Mood
                          </Label>
                          <Select value={mood} onValueChange={setMood}>
                            <SelectTrigger className="h-12 bg-white/50 rounded-xl border-slate-200">
                              <SelectValue placeholder="How's your mood?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Excellent">Excellent - Feeling Great</SelectItem>
                              <SelectItem value="Good">Good - Positive Vibes</SelectItem>
                              <SelectItem value="Neutral">Neutral - Just Okay</SelectItem>
                              <SelectItem value="Low">Low - Feeling Down</SelectItem>
                              <SelectItem value="Very Low">Very Low - Struggling</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="flex items-center font-bold text-slate-700">
                              <Activity className="w-4 h-4 mr-2 text-emerald-500" />
                              Assignment Load
                            </Label>
                            <span className="text-sm font-bold bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full">{load}/10</span>
                          </div>
                          <Slider 
                            value={[load]} 
                            max={10} 
                            min={1} 
                            step={1} 
                            onValueChange={(val) => setLoad(val[0])}
                            className="py-2"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="flex items-center font-bold text-slate-700">
                              <Heart className="w-4 h-4 mr-2 text-red-500" />
                              Social Activity
                            </Label>
                            <span className="text-sm font-bold bg-red-100 text-red-600 px-3 py-1 rounded-full">{social}/10</span>
                          </div>
                          <Slider 
                            value={[social]} 
                            max={10} 
                            min={1} 
                            step={1} 
                            onValueChange={(val) => setSocial(val[0])}
                            className="py-2"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="flex items-center font-bold text-slate-700">
                              <Monitor className="w-4 h-4 mr-2 text-slate-500" />
                              Screen Time
                            </Label>
                            <span className="text-sm font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{screen} hrs</span>
                          </div>
                          <Slider 
                            value={[screen]} 
                            max={16} 
                            min={0} 
                            step={1} 
                            onValueChange={(val) => setScreen(val[0])}
                            className="py-2"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="flex items-center font-bold text-slate-700">
                              <BrainCircuit className="w-4 h-4 mr-2 text-purple-500" />
                              Motivation Level
                            </Label>
                            <span className="text-sm font-bold bg-purple-100 text-purple-600 px-3 py-1 rounded-full">{motivation}/10</span>
                          </div>
                          <Slider 
                            value={[motivation]} 
                            max={10} 
                            min={1} 
                            step={1} 
                            onValueChange={(val) => setMotivation(val[0])}
                            className="py-2"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-bold rounded-2xl shadow-xl transition-all duration-300"
                    >
                      {submitting ? (
                        <>
                          <BrainCircuit className="mr-3 h-6 w-6 animate-spin" />
                          AI Analyzing behavioral patterns...
                        </>
                      ) : (
                        "Generate Burnout Risk Prediction"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass border-transparent shadow-xl rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-500">
                <CardHeader className="text-center pb-2 pt-8">
                  <div className="flex justify-center mb-4">
                    <div className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center shadow-inner",
                      getRiskColor(prediction.level)
                    )}>
                      <span className="text-4xl font-extrabold">{prediction.score}</span>
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold">Burnout Analysis Result</CardTitle>
                  <CardDescription className="text-lg">
                    Risk Level: 
                    <span className={cn(
                      "ml-2 font-bold uppercase tracking-wider",
                      prediction.level === "high" ? "text-high" : prediction.level === "moderate" ? "text-moderate" : "text-low"
                    )}>
                      {prediction.level === "high" ? "🔴 High" : prediction.level === "moderate" ? "🟡 Moderate" : "🟢 Low"} Risk
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                      <span>BURNOUT SCORE</span>
                      <span>{prediction.score}%</span>
                    </div>
                    <Progress 
                      value={prediction.score} 
                      className="h-4 bg-slate-100" 
                      indicatorClassName={cn(
                        prediction.level === "high" ? "bg-high" : prediction.level === "moderate" ? "bg-moderate" : "bg-low"
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 flex items-center">
                        <Info className="w-4 h-4 mr-2 text-indigo-600" />
                        AI Insights
                      </h4>
                      <p className="text-slate-600 bg-white/40 p-4 rounded-2xl border border-white/40 leading-relaxed italic">
                        "Your current data shows a {prediction.score}% correlation with burnout patterns. 
                        Your stress levels seem high relative to your sleep cycle. Adjusting your evening routine could lower this risk significantly."
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                        Actionable Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {getRecommendations(prediction.score).map((rec, i) => (
                          <li key={i} className="flex items-start text-slate-600 bg-white/20 p-2 rounded-lg">
                            <ChevronRight className="w-4 h-4 mr-2 text-indigo-400 mt-1 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setPrediction(null)}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl border-slate-200"
                    >
                      New Assessment
                    </Button>
                    <Button 
                      className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                    >
                      Save Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Chart */}
            <Card className="glass border-transparent shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl font-bold">Burnout Trends</CardTitle>
                  <CardDescription>Weekly progression of your well-being</CardDescription>
                </div>
                <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
                  <button className="px-3 py-1 text-xs font-bold rounded bg-white shadow-sm">Weekly</button>
                  <button className="px-3 py-1 text-xs font-bold text-slate-500 rounded">Monthly</button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Widgets */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Stats */}
            <Card className="glass border-transparent shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Today's Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase">Sleep</p>
                      <p className="text-lg font-bold text-slate-800">7.5 Hours</p>
                    </div>
                  </div>
                  <div className="text-emerald-500 text-xs font-bold">+12%</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg text-white">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase">Study</p>
                      <p className="text-lg font-bold text-slate-800">5.2 Hours</p>
                    </div>
                  </div>
                  <div className="text-amber-500 text-xs font-bold">-5%</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-pink-50/50 rounded-2xl border border-pink-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-pink-500 rounded-lg text-white">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-pink-600 uppercase">Stress</p>
                      <p className="text-lg font-bold text-slate-800">Low (3/10)</p>
                    </div>
                  </div>
                  <div className="text-emerald-500 text-xs font-bold">Stable</div>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant Preview */}
            <Card className="glass border-transparent shadow-xl rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <BrainCircuit className="w-24 h-24" />
              </div>
              <CardHeader className="relative">
                <CardTitle className="text-xl font-bold">EduAI Assistant</CardTitle>
                <CardDescription className="text-indigo-100">Feeling overwhelmed? Chat with our specialist AI.</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20">
                  <p className="text-sm italic">"I'm here to help you manage your stress levels and find a healthy balance."</p>
                </div>
                <Link to="/chat">
                  <Button className="w-full bg-white text-indigo-600 hover:bg-white/90 font-bold rounded-xl h-12 shadow-lg">
                    Start Consultation
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="glass border-transparent shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Advanced Calculus", date: "Tomorrow, 10:00 AM", color: "bg-red-500" },
                  { title: "Psychology Research", date: "Friday, 11:59 PM", color: "bg-amber-500" },
                  { title: "Data Structures Project", date: "Next Monday", color: "bg-indigo-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 group cursor-pointer">
                    <div className={cn("w-1.5 h-10 rounded-full", item.color)} />
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.date}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
