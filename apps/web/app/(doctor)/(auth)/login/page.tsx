import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Đăng nhập - MediFlow",
  description: "Đăng nhập vào tài khoản MediFlow của bạn để tiếp tục học tiếng Anh với AI.",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-2xl font-bold text-lime-400">GIPHE</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Chào mừng trở lại!</h2>
          <p className="mt-2 text-gray-600">Đăng nhập để tiếp tục học tiếng Anh với AI</p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-lime-400 hover:text-lime-500 font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}