"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import ThemeToggle from "@/components/landingpage/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const { loginWithGoogle, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (user: {
    email: string;
    name: string;
    image?: string;
  }) => {
    try {
      setError("");
      const res = await loginWithGoogle(user);
      console.log("Google login result:", res);
      if (res.success) await router.push("/dashboard");
      else throw new Error(res.message);
    } catch (err: any) {
      setError(err.message || "Google đăng nhập thất bại");
    }
  };

  const handleGoogleError = (error: string) => {
    setError(error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-green-400 dark:bg-green-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left space-y-8"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🧑‍⚕️</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  MediFlow
                </h1>
              </div>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-200 leading-tight">
              Chào mừng trở lại!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Bắt đầu công việc cùng MediFlow
            </p>
          </div>

          {/* Features */}
          {/* <div className="space-y-4">
            {[
              "🎯 AI cá nhân hóa theo trình độ",
              "🗣️ Luyện nói với giọng AI tự nhiên",
              "📊 Theo dõi tiến độ chi tiết",
              "🏆 Chứng chỉ được công nhận",
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center space-x-3 text-gray-700 dark:text-gray-300"
              >
                <span>{feature}</span>
              </motion.div>
            ))}
          </div> */}
        </motion.div>

        {/* Right side - Login form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
            <CardHeader className="space-y-1 text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Đăng nhập
              </CardTitle>
             
            </CardHeader>

            <CardContent className="space-y-6">
              <GoogleAuthButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-4 text-gray-500 dark:text-gray-400 font-medium">
                    Hoặc đăng nhập với email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 dark:text-gray-300 font-medium"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 dark:text-gray-300 font-medium"
                  >
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Alert
                      variant="destructive"
                      className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    >
                      <AlertDescription className="text-red-700 dark:text-red-400">
                        {error}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <Button
                size="lg"
                className="shadow-3xl w-full border-2 border-white bg-gradient-to-r rounded-full from-blue-600/80 to-green-600/10  hover:from-blue-300 hover:to-green-400 text-white px-8 py-4 text-lg group"
              >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang đăng nhập...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Đăng nhập</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Chưa có tài khoản?{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </div> */}
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-20 opacity-20">
        <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
      </div>
      <div className="absolute bottom-20 right-20 opacity-20">
        <Sparkles
          className="h-8 w-8 text-green-500 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>
    </div>
  );
}
