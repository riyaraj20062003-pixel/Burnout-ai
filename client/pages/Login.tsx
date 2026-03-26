import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { login, ApiClientError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import CenteredAuthLayout from "@/components/layouts/CenteredAuthLayout";
import { setAuthSession } from "@/lib/auth";

const MOCK_CREDENTIALS = {
  student: { email: "student@example.com", password: "password123" },
  parent: { email: "parent@example.com", password: "password123" },
  mentor: { email: "mentor@example.com", password: "password123" },
} as const;

export default function LoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const safeRole = role === "student" || role === "parent" || role === "mentor"
    ? role
    : "student";
  const demoCreds = MOCK_CREDENTIALS[safeRole];

  const roleTitle = role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login({
        email,
        password,
        role: safeRole,
      });

      setAuthSession(data.token, data.user.role);

      toast({
        title: "Signed in",
        description: "Welcome back. Redirecting to your dashboard.",
      });

      navigate(`/${safeRole}/dashboard`);
    } catch (error) {
      const message = error instanceof ApiClientError
        ? error.message
        : "Unable to sign in. Please try again.";

      toast({
        title: "Sign in failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenteredAuthLayout
      title={`${roleTitle} Login`}
      subtitle="Access your personalized EduRelief AI dashboard."
    >
      <div className="mx-auto w-full max-w-md">
        <Card className="border-transparent bg-white/70 shadow-2xl backdrop-blur rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-700">
              <p className="font-semibold">Demo credentials for {safeRole} testing</p>
              <p>Email: {demoCreds.email}</p>
              <p>Password: {demoCreds.password}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-2 h-8 text-xs"
                onClick={() => {
                  setEmail(demoCreds.email);
                  setPassword(demoCreds.password);
                }}
              >
                Use Demo Credentials
              </Button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@university.edu" 
                    className="pl-10 h-12 bg-white/50 border-slate-200 focus:border-indigo-500 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-indigo-600 hover:underline">Forgot?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-12 bg-white/50 border-slate-200 focus:border-indigo-500 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 mt-4 pt-6">
            <p className="text-sm text-slate-500">
              New here? <a href="#" className="text-indigo-600 font-semibold hover:underline">Create an account</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </CenteredAuthLayout>
  );
}
