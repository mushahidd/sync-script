"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Loader2, ArrowLeft, Shield, Zap, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null);

  const handleDemoLogin = async (demoEmail: string, role: string) => {
    setIsDemoLoading(role);
    setError("");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: demoEmail,
        password: "password123",
      });

      if (result?.error) {
        setError(result.error);
        setIsDemoLoading(null);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("Demo login failed");
      setIsDemoLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      setError("Google sign-in failed");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 noise-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-4 sm:mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs sm:text-sm">Back to Home</span>
        </Link>

        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-1"
          >
            <Image 
              src="/logo.png" 
              alt="SyncScript" 
              width={60} 
              height={60}
              className="object-contain sm:w-20 sm:h-20"
            />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">Welcome Back</h1>
          <p className="text-sm sm:text-base text-slate-400">Sign in to your SyncScript account</p>
        </div>

        <Card className="relative overflow-hidden border-primary/20 shadow-lg shadow-primary/5">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none"></div>
          <div className="relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Secure Login
            </CardTitle>
            <CardDescription>Enter your credentials to access your vaults</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="alice@syncscript.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="text-right">
                  <Link href="#" className="text-xs text-slate-400 hover:text-primary transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full group"
                size="lg"
                disabled={isLoading || isGoogleLoading || isDemoLoading !== null}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Sign In
                  </>
                )}
              </Button>

              {/* Quick Demo Login */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-400 text-center">Quick Demo Access:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDemoLogin("alice@syncscript.com", "owner")}
                    disabled={isLoading || isGoogleLoading || isDemoLoading !== null}
                    className="flex flex-col h-auto py-3 px-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    {isDemoLoading === "owner" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mb-1 text-primary" />
                        <span className="text-[10px] font-medium">Owner</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDemoLogin("bob@syncscript.com", "contributor")}
                    disabled={isLoading || isGoogleLoading || isDemoLoading !== null}
                    className="flex flex-col h-auto py-3 px-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    {isDemoLoading === "contributor" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Users className="w-4 h-4 mb-1 text-blue-400" />
                        <span className="text-[10px] font-medium">Contributor</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDemoLogin("charlie@syncscript.com", "viewer")}
                    disabled={isLoading || isGoogleLoading || isDemoLoading !== null}
                    className="flex flex-col h-auto py-3 px-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    {isDemoLoading === "viewer" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mb-1 text-slate-400" />
                        <span className="text-[10px] font-medium">Viewer</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-2 text-slate-400">Or continue with</span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <Button
                type="button"
                variant="secondary"
                className="w-full group"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading || isDemoLoading !== null}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-slate-400">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:text-primary-light transition-colors font-medium">
                  Sign up
                </Link>
              </div>
            </form>

            {/* Trust Indicators */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span>Instant Access</span>
                </div>
              </div>
            </div>
          </CardContent>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
