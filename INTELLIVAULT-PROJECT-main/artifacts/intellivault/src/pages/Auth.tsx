import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Globe, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function Auth() {
  const [location] = useLocation();
  const isSignup = location === "/signup";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const payload = {
      firstName,
      lastName,
      email,
      password,
    };

    try {
      const endpoint = isSignup ? "/api/signup" : "/api/signin";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message ?? "Server error");
      }

      const data = await response.json();
      if (data.token) localStorage.setItem("intellivault_token", data.token);

      toast({
        title: isSignup ? "Account created" : "Signed in",
        description: `Welcome back, ${firstName || data.user?.name || "user"}!`,
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 400);
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Unexpected error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      // Simulate OAuth flow - in real app, this would redirect to Google OAuth
      toast({
        title: "Connecting to Google...",
        description: "Authenticating with Google OAuth...",
      });

      // Simulate API call to backend for Google auth
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "google" }),
      });

      if (!response.ok) {
        throw new Error("Google authentication failed");
      }

      const data = await response.json();
      if (data.token) localStorage.setItem("intellivault_token", data.token);

      toast({
        title: "Signed in with Google",
        description: `Welcome back, ${data.user?.name || "user"}!`,
      });

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (error) {
      toast({
        title: "Google Auth Failed",
        description: error instanceof Error ? error.message : "Unable to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-md mx-auto p-6 glass-panel rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-4">{isSignup ? "Sign Up" : "Sign In"}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {isSignup
              ? "Create an account and start protecting your assets."
              : "Welcome back! Log in to continue to IntelliVault."}
          </p>

          <Button
            variant="secondary"
            onClick={handleGoogle}
            className="w-full mb-4 justify-center gap-2"
          >
            <Globe className="h-4 w-4" /> Continue with Google
          </Button>

          <div className="text-center text-sm text-muted-foreground mb-5">or use email and password</div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isSignup && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="First name"
                  value={firstName}
                  onChange={(evt) => setFirstName(evt.target.value)}
                  className="bg-background/60 text-white border-white/20"
                  icon={User}
                />
                <Input
                  placeholder="Last name"
                  value={lastName}
                  onChange={(evt) => setLastName(evt.target.value)}
                  className="bg-background/60 text-white border-white/20"
                />
              </div>
            )}

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(evt) => setEmail(evt.target.value)}
              className="bg-background/60 text-white border-white/20"
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
              className="bg-background/60 text-white border-white/20"
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Working..." : isSignup ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-sm text-muted-foreground text-center">
            {isSignup ? (
              <>
                Already have an account? <Link href="/signin" className="text-primary">Sign in</Link>
              </>
            ) : (
              <>
                New user? <Link href="/signup" className="text-primary">Create an account</Link>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
