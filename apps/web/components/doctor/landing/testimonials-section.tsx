"use client";

import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { ScrollObserver } from "./scroll-observer";

const plans = [
  {
    name: "Gói CƠ BẢN",
    price: "25.000.000đ",
    period: "/tháng",
    description: "Dành cho các phòng khám < 20 bác sĩ",
    features: [
      "AI Chatbot cơ bản",
      "Quy trình đặt lịch",
      "Báo cáo tổng quát cơ bản",
      "MediVoice",
      "Tin nhắn nội bộ",
    ],
    popular: false,
    buttonText: "Bắt đầu",
    buttonVariant: "outline" as const,
  },
  {
    name: "Gói CHUYÊN NGHIỆP",
    price: "80.000.000đ",
    period: "/tháng",
    description: "Trải nghiệm toàn diện với AI thông minh",
    features: [
      "Băng thông người dùng tăng",
      "AI chatbot custom tính cách",
      "Hệ thống AI Agent nội bộ",
      "Báo cáo tổng quát nâng cao",
      "Schedule thông minh",
      "Cá nhân hóa hoàn toàn",
      "Hỗ trợ ưu tiên 24/7",
    ],
    popular: true,
    buttonText: "Nâng cấp Premium",
    buttonVariant: "default" as const,
  },
  {
    name: "Gói TẬP ĐOÀN",
    price: "225.000.000đ",
    period: "/tháng",
    description: "Trải nghiệm toàn diện với AI thông minh",
    features: [
      "Không giới hạn số lượng bệnh nhân",
      "AI chatbot custom tính cách",
      "Hệ thống AI Agent nội bộ",
      "Báo cáo tổng quát nâng cao",
      "Schedule thông minh",
      "Cá nhân hóa hoàn toàn",
      "Hỗ trợ ưu tiên 24/7",
      "Quản lý đa chi nhánh",
      "Tích hợp hệ thống nâng cao",
    ],
    popular: false,
    buttonText: "Nâng cấp Premium",
    buttonVariant: "outline" as const,
  },
];

export function PricingPlans() {
  return (
    <section id="pricing" className="py-20 ">
      <div className="w-full px-4">
        <ScrollObserver className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Các <span className="text-teal-600">chương trình</span> của MediFlow
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chọn quy mô phù hợp cho phòng khám của bạn
          </p>
        </ScrollObserver>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <ScrollObserver
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl border-2 p-8 ${
                plan.popular
                  ? "border-teal-400 transform scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-teal-400 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Phổ biến nhất
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-teal-400">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="w-5 h-5 text-teal-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full bottom-0 py-3 text-lg font-semibold rounded-full ${
                  plan.popular
                    ? "bg-teal-400 hover:bg-teal-500 text-white"
                    : "border-teal-400 bg-white text-teal-400 hover:bg-teal-50"
                }`}
                variant={plan.buttonVariant}
              >
                {plan.buttonText}
              </Button>
            </ScrollObserver>
          ))}
        </div>
      </div>
    </section>
  );
}
