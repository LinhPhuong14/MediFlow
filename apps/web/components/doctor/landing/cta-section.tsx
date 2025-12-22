"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Phone, Mail, MapPin } from "lucide-react";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="py-12 sm:py-16 lg:py-20 bg-lime-500/5 relative overflow-hidden transition-colors duration-300"
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
            <div className="text-teal-800">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 font-montserrat">
                Điền form liên hệ
              </h2>
              <p className="text-lg sm:text-xl text-teal-800/80 mb-6 sm:mb-8 font-montserrat">
                Để được tư vấn miễn phí ngay hôm nay!
              </p>

              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-teal-800" />
                  </div>
                  <div>
                    <div className="font-semibold font-montserrat text-sm sm:text-base">
                      Hotline
                    </div>
                    <div className="text-teal-800/80 font-montserrat text-sm sm:text-base">
                      1900 1234
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-teal-800" />
                  </div>
                  <div>
                    <div className="font-semibold font-montserrat text-sm sm:text-base">
                      Email
                    </div>
                    <div className="text-teal-800/80 font-montserrat text-sm sm:text-base">
                      support@mediflow.com
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-teal-800" />
                  </div>
                  <div>
                    <div className="font-semibold font-montserrat text-sm sm:text-base">
                      Địa chỉ
                    </div>
                    <div className="text-teal-800/80 font-montserrat text-sm sm:text-base">
                      Hà Nội, Việt Nam
                    </div>
                  </div>
                </motion.div>
              </div>
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
                      Email (*)
                    </label>
                    <Input
                      type="email"
                      placeholder="Nhập địa chỉ email của bạn"
                      className="w-full font-montserrat dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-montserrat">
                      Quy mô phòng khám của bạn (*)
                    </label>
                    <Select>
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                        <SelectValue placeholder="Lựa chọn" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ielts">1-5 Phòng khám</SelectItem>
                        <SelectItem value="toeic">Bệnh viện tỉnh</SelectItem>
                        <SelectItem value="business">
                          Bệnh viện trung ương
                        </SelectItem>
                        <SelectItem value="conversation">
                          Chuỗi bệnh viện
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-montserrat">
                    Nội dung
                  </label>
                  <Textarea
                    placeholder="Câu hỏi hoặc yêu cầu của bạn..."
                    rows={4}
                    className="font-montserrat dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-montserrat">
                  Bằng việc gửi đăng ký nhận tư vấn, bạn đã đồng ý với{" "}
                  <a
                    href="#"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Chính sách bảo mật thông tin của MediFlow
                  </a>
                </p>

                <Button
                type="submit"
                className="shadow-3xl w-full mx-auto border-2 border-white bg-gradient-to-r rounded-full from-blue-600/80 to-green-600/10  hover:from-blue-300 hover:to-green-400 text-white px-8 py-4 text-lg group"
              >
                <a href="/patient/register" className="flex items-center">
                  Gửi thông tin
                  <Send className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
