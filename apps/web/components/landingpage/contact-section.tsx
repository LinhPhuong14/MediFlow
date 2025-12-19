"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Phone, Mail, MapPin } from "lucide-react"

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 dark:from-blue-800 dark:via-blue-900 dark:to-green-800 relative overflow-hidden transition-colors duration-300"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20">
        <div className="absolute top-10 left-10 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 sm:w-48 sm:h-48 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Side - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-white">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 font-montserrat">
                Bạn còn câu hỏi khác?
              </h2>
              <p className="text-lg sm:text-xl text-white/80 mb-6 sm:mb-8 font-montserrat">
                Hãy để lại thông tin, GIPHE sẽ liên hệ và hỗ trợ xử lý mọi vướng mắc của bạn
              </p>

              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold font-montserrat text-sm sm:text-base">Hotline</div>
                    <div className="text-white/80 font-montserrat text-sm sm:text-base">1900 1234</div>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold font-montserrat text-sm sm:text-base">Email</div>
                    <div className="text-white/80 font-montserrat text-sm sm:text-base">support@giphe.com</div>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold font-montserrat text-sm sm:text-base">Địa chỉ</div>
                    <div className="text-white/80 font-montserrat text-sm sm:text-base">Hà Nội, Việt Nam</div>
                  </div>
                </motion.div>
              </div>

              {/* Mascot */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="inline-block"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-4xl sm:text-6xl">🐸</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <form className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-montserrat">
                    Họ và tên (*)
                  </label>
                  <Input
                    placeholder="Nhập họ và tên của bạn"
                    className="w-full font-montserrat dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-montserrat">
                    Số điện thoại (*)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select defaultValue="+84">
                      <SelectTrigger className="w-full sm:w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+84">+84</SelectItem>
                        <SelectItem value="+1">+1</SelectItem>
                        <SelectItem value="+44">+44</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="934554586"
                      className="flex-1 font-montserrat dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-montserrat">
                      Năm sinh (*)
                    </label>
                    <Input
                      placeholder="Nhập năm sinh của bạn"
                      className="w-full font-montserrat dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-montserrat">
                      Email (*)
                    </label>
                    <Input
                      type="email"
                      placeholder="Nhập địa chỉ email của bạn"
                      className="w-full font-montserrat dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-montserrat">
                    Bạn là
                  </label>
                  <Select>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      <SelectValue placeholder="Lựa chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Học sinh/Sinh viên</SelectItem>
                      <SelectItem value="worker">Người đi làm</SelectItem>
                      <SelectItem value="teacher">Giáo viên</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-montserrat">
                    Khóa học bạn quan tâm (*)
                  </label>
                  <Select>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      <SelectValue placeholder="Lựa chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ielts">IELTS</SelectItem>
                      <SelectItem value="toeic">TOEIC</SelectItem>
                      <SelectItem value="business">Business English</SelectItem>
                      <SelectItem value="conversation">Giao tiếp cơ bản</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-montserrat">
                    Nội dung
                  </label>
                  <Textarea
                    placeholder="Bạn có câu hỏi gì?&#10;• Hãy cho GIPHE biết trình độ hiện tại&#10;• Mục tiêu mong muốn"
                    rows={4}
                    className="font-montserrat dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-montserrat">
                  Bằng việc gửi đăng ký nhận tư vấn, bạn đã đồng ý với{" "}
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Chính sách bảo mật thông tin của GIPHE
                  </a>
                </p>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 text-base sm:text-lg font-montserrat group"
                >
                  Gửi câu hỏi
                  <Send className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}