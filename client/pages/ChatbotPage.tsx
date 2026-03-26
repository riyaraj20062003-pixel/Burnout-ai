import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MessageSquare,
  RefreshCw,
  MoreVertical,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import DashboardLayout, { DashboardNavItem } from "@/components/layouts/DashboardLayout";
import { ApiClientError, getChatHistory, sendChatMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  time: string;
  suggestions?: string[];
}

export default function ChatbotPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navItems: DashboardNavItem[] = [
    { id: "overview", icon: Bot, label: "Dashboard", path: "/student/dashboard" },
    { id: "analysis", icon: Sparkles, label: "Trend Analysis", path: "/student/dashboard" },
    { id: "chat", icon: MessageSquare, label: "AI Chat Assistant", path: "/chat" },
    { id: "resources", icon: Bot, label: "Resources", path: "/student/dashboard" },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    let mounted = true;

    getChatHistory()
      .then((history) => {
        if (!mounted) {
          return;
        }

        const mapped: Message[] = history.map((item) => ({
          id: item.id,
          role: item.role === "assistant" ? "bot" : "user",
          text: item.content,
          time: new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setMessages(mapped);
      })
      .catch((error) => {
        const message =
          error instanceof ApiClientError
            ? error.message
            : "Could not load Lisa chat history.";

        toast({
          title: "Chat unavailable",
          description: message,
          variant: "destructive",
        });
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingHistory(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage({
        message: userMsg.text,
        history: messages.slice(-8).map((item) => ({
          role: item.role === "bot" ? "assistant" : "user",
          content: item.text,
        })),
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: response.reply,
        suggestions: response.suggestions,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Lisa could not respond right now.";

      toast({
        title: "Response failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <DashboardLayout
      title="EduAI Assistant"
      subtitle="Always here to listen"
      navItems={navItems}
      activeNavId={activeTab}
      onNavChange={setActiveTab}
      signOutPath="/"
      headerActions={
        <>
          <Button variant="ghost" size="icon" className="text-slate-500" aria-label="Refresh chat context">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-500" aria-label="Open chat options">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <div className="-mx-4 -my-8 flex h-[calc(100vh-6rem)] flex-col overflow-hidden px-4 md:-mx-8 md:px-8">

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {isLoadingHistory ? (
            <div className="rounded-2xl border border-white/40 bg-white/50 p-4 text-sm text-slate-600">
              Loading Lisa conversation context...
            </div>
          ) : null}

          <div className="flex justify-center mb-8">
            <div className="bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/30 text-xs text-slate-500 flex items-center shadow-sm">
              <Sparkles className="w-3 h-3 mr-2 text-indigo-400" />
              AI Support is available 24/7. Your data is private.
            </div>
          </div>

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex items-start group",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0 mt-1",
                msg.role === "user" ? "bg-purple-600 ml-3" : "bg-indigo-600 mr-3"
              )}>
                {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={cn(
                "max-w-[85%] md:max-w-[70%] space-y-2",
                msg.role === "user" ? "items-end text-right" : "items-start text-left"
              )}>
                <div className={cn(
                  "p-4 md:p-5 rounded-3xl shadow-lg border relative group",
                  msg.role === "user" 
                    ? "bg-purple-600 text-white border-transparent rounded-tr-none" 
                    : "glass text-slate-800 border-white/40 rounded-tl-none"
                )}>
                  <p className="text-sm md:text-base leading-relaxed">
                    {msg.text}
                  </p>
                  
                  {msg.role === "bot" && (
                    <div className="absolute -bottom-4 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-white shadow-sm border border-slate-100" aria-label="Mark Lisa response helpful">
                        <ThumbsUp className="w-3 h-3 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-white shadow-sm border border-slate-100" aria-label="Mark Lisa response not helpful">
                        <ThumbsDown className="w-3 h-3 text-slate-400" />
                      </Button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 px-2 uppercase font-bold tracking-wider">
                  {msg.time}
                </span>
                {msg.role === "bot" && msg.suggestions?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSuggestion(suggestion)}
                        aria-label={`Use suggestion: ${suggestion}`}
                        className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md flex-shrink-0 mt-1 mr-3">
                <Bot className="w-5 h-5" />
              </div>
              <div className="glass p-4 rounded-3xl rounded-tl-none border-white/40 flex space-x-1 items-center" role="status" aria-live="polite">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="sr-only">Lisa is typing</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="glass p-4 md:p-6 border-t border-white/20">
        <form 
          onSubmit={handleSend}
          className="max-w-3xl mx-auto flex items-center space-x-4"
        >
          <div className="relative flex-1">
            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me how you're feeling..."
              aria-label="Message Lisa"
              className="w-full h-14 pl-12 pr-4 bg-white/60 border-transparent focus:border-indigo-500 rounded-2xl shadow-inner text-base"
              disabled={isTyping}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="h-14 w-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all duration-300"
            aria-label="Send message"
          >
            <Send className="w-6 h-6" />
          </Button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
          EduRelief AI is not a clinical replacement for professional medical therapy.
        </p>
      </div>
      </div>
    </DashboardLayout>
  );
}
