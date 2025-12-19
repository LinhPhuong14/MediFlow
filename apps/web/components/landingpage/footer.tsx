"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Facebook, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

type Collapsible = "courses" | "guide" | "about" | null

export default function Footer() {
  const [open, setOpen] = useState<Collapsible>(null)

  const toggle = (section: Collapsible) => {
    setOpen(open === section ? null : section)
  }

  const CollapsibleList = ({
    id,
    title,
    items,
  }: {
    id: Collapsible
    title: string
    items: string[]
  }) => (
    <div className="lg:col-span-1">
      {/* Mobile toggle button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          className="w-full p-0 h-auto font-bold text-gray-800 dark:text-gray-200 flex justify-between"
          onClick={() => toggle(id)}
        >
          {title}
          <ChevronDown className={`h-4 w-4 transition-transform ${open === id ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {/* Desktop heading */}
      <h4 className="hidden md:block font-bold text-gray-800 dark:text-gray-200 mb-4">{title}</h4>

      {/* List */}
      {(open === id || typeof window === "undefined" || window.innerWidth >= 768) && (
        <ul className="space-y-3 mt-4 md:mt-0">
          {items.map((text) => (
            <motion.li key={text} whileHover={{ x: 5 }}>
              <a
                href="#"
                className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm sm:text-base"
              >
                {text}
              </a>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  )

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Logo & downloads */}
          <div className="lg:col-span-1">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-2 mb-6">
              <span className="text-2xl">🐸</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">GIPHE</span>
            </motion.div>

            <div className="mb-6">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 text-sm sm:text-base">
                TẢI ỨNG DỤNG TRÊN ĐIỆN THOẠI
              </h4>
              <div className="space-y-3">
                {["Google Play", "App Store"].map((label) => (
                  <motion.a key={label} whileHover={{ scale: 1.05 }} href="#" className="block">
                    <Image src="/placeholder.svg?height=40&width=135" alt={label} className="h-8 sm:h-10" width={135} height={40} />
                  </motion.a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 text-sm sm:text-base">
                KẾT NỐI VỚI CHÚNG TÔI
              </h4>
              <div className="flex space-x-3">
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                >
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                >
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                </motion.a>
              </div>
            </div>
          </div>

          {/* Collapsible columns */}
          <CollapsibleList id="courses" title="CHƯƠNG TRÌNH HỌC" items={["IELTS", "TOEIC", "Tiếng Anh Giao tiếp"]} />

          <CollapsibleList
            id="guide"
            title="HƯỚNG DẪN SỬ DỤNG GIPHE"
            items={[
              "Cách sử dụng phòng luyện đề",
              "Cách xây dựng lộ trình học",
              "Hướng dẫn thanh toán và kích hoạt mã",
            ]}
          />

          <CollapsibleList
            id="about"
            title="VỀ GIPHE"
            items={[
              "Chính sách dùng AI",
              "Điều kiện & điều khoản",
              "Chính sách bảo mật",
              "Chính sách thanh toán",
              "Tuyển dụng",
            ]}
          />

          {/* Company info */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 text-sm sm:text-base">
                CÔNG TY CỔ PHẦN CÔNG NGHỆ GIPHE
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <li>MSDN: </li>
                <li>Địa chỉ liên hệ: Tầng 4 Tòa Vinaconex-34 Láng Hạ, Q. Đống Đa, TP. Hà Nội.</li>
                <li>Địa chỉ kinh doanh: NQ.21-C2 KĐT Nam Trung Yên, P. Trung Hòa, Q. Cầu Giấy, TP. Hà Nội.</li>
                <li>Trụ sở: SN 20, ngách 234/35, Đ. Hoàng Quốc Việt, P. Cổ Nhuế 1, Q. Bắc Từ Liêm, TP. Hà Nội.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-4 md:mb-0">
              © 2025 GIPHE. Tất cả quyền được bảo lưu.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1"
            >
              <span className="text-xs sm:text-sm">Có thể bạn quan tâm</span>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}