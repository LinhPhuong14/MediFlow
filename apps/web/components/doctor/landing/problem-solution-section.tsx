"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"

const AlertTriangle = () => (
  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.186-.833-2.956 0L3.858 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
)

const CheckCircle = () => (
  <svg className="h-5 w-5 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const ArrowRight = () => (
  <svg
    className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export function ProblemSolutionSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section ref={sectionRef} id="problem" className="py-16 sm:py-24 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-12 sm:mb-20 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/20 text-teal-950 text-sm font-light mb-6">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            Vấn đề bệnh viện đang gặp phải
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-teal-950 text-balance mb-4 sm:mb-6">
            <span className="text-red-700">35-40%</span> Thời gian của bác sĩ bị lãng phí cho công việc hành chính
          </h2>
          <p className="text-base sm:text-md md:text-lg text-teal-950/70 max-w-4xl mx-auto font-light leading-relaxed">
            MediFlow giúp tự động hóa các tác vụ lặp đi lặp lại, giải phóng thời gian quý báu cho bác sĩ.
          </p>
        </div>

        {/* Main Problem/Solution Cards */}
        <div
          className={`grid lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-20 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          {/* Problem Card */}
          <div className="group">
            <div className="bg-red-800/30 backdrop-blur-md border border-white/40 border-2 rounded-2xl p-6 sm:p-8 h-full transition-all duration-500 hover:border-white/90">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-white/20">
                  <AlertTriangle />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-red-700">Thực trạng</h3>
              </div>

              {/* Key Stat */}
              <div className="bg-red-500/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 sm:p-6 mb-6">
                <div className="text-3xl sm:text-4xl font-bold text-red-700 mb-2">4000 Lượt khám/ngày</div>
                <p className="text-white/80 text-sm sm:text-base">
                  Nhưng 40% thời gian của bác sĩ để nhập hiệu hồ sơ
                </p>
              </div>

              {/* Problem Points */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-white/80 text-sm sm:text-base">
                    Mất hàng trăm triệu USD vì rào cản ngôn ngữ
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-white/80 text-sm sm:text-base">
                    Giảm hiệu suất vì nhiều công việc hành chính
                  </p>
                </div>
                
              </div>
            </div>
          </div>

          {/* Solution Card */}
          <div className="group">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 h-full hover:bg-white/10 transition-all duration-500 hover:border-green-400/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-green-700">Giải pháp MediFlow</h3>
              </div>

              {/* Key Stat */}
              <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 sm:p-6 mb-6">
                <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">AI Agents</div>
                <p className="text-teal-800/80 text-sm sm:text-base">
                  Hệ thống AI hỗ trợ quy trình toàn diện
                </p>
              </div>

              {/* Solution Points */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle />
                  <p className="text-teal-800/70 text-sm sm:text-base">Instantly qualifies leads and books appointments</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle />
                  <p className="text-teal-800/70 text-sm sm:text-base">Integrates with your CRM and calendar system</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle />
                  <p className="text-teal-800/70 text-sm sm:text-base">Works across website, WhatsApp, email, and phone</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-16 transition-all duration-1000 delay-600 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center bg-teal-500/10 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-6 transition-all duration-300">
            <div className="text-2xl sm:text-3xl font-bold text-teal-800 mb-2">30-50%</div>
            <p className="text-teal-800/70 text-xs sm:text-sm">Thời gian ghi chép giảm</p>
          </div>
          <div className="text-center bg-teal-500/10 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-6 transition-all duration-300">
            <div className="text-2xl sm:text-3xl font-bold text-teal-800 mb-2">20-30%</div>
            <p className="text-teal-800/70 text-xs sm:text-sm">Lượt khám/ngày tăng</p>
          </div>
          <div className="text-center bg-teal-500/10 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-6 transition-all duration-300">
            <div className="text-2xl sm:text-3xl font-bold text-teal-800 mb-2">3.5~4h</div>
            <p className="text-teal-800/70 text-xs sm:text-sm">Thời gian làm việc của y tá được giải phóng</p>
          </div>
        </div>

        {/* CTA Section */}
        <div
          className={`text-center bg-teal-700/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 transition-all duration-1000 delay-900 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-800 mb-3 sm:mb-4 text-balance">
            Tái thiết dòng chảy y tế cùng MediFlow
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-teal-800/70 mb-6 sm:mb-8 max-w-2xl mx-auto font-light leading-relaxed">
           Không chỉ là trợ lý AI đồng hành, chúng tôi là giải pháp chuyển đổi số linh hoạt.
          </p>
          <Button
            size="lg"
            className="bg-white text-black rounded-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium transition-all duration-300 hover:bg-gray-50 hover:scale-105 hover:shadow-lg group cursor-pointer"
          >
            Nhận tư vấn
            <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  )
}
