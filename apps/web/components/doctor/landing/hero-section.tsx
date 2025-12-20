import { Button } from "@/components/ui/button";
import RotatingText from "./RotatingText";
import ShaderBackground from "@/components/landingpage/shader-background";

const ArrowRight = () => (
  <svg
    className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const Play = () => (
  <svg
    className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"
    />
  </svg>
);

export function HeroSection() {
  return (
    // <ShaderBackground>
      <section className=" min-h-screen flex items-center justify-center px-4 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-hero">
          {/* Badge */}
          <div className="inline-flex text-teal-950 items-center px-4 py-2 rounded-full bg-white/30 backdrop-blur-md border border-white/20 text-sm font-light mb-8 mt-12 animate-fade-in-badge">
            <span className="w-2 h-2 text-lime-900 bg-lime-600/60 rounded-full mr-2 animate-pulse"></span>
            Quy trình thông minh cho bệnh viện
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-balance mb-6 animate-fade-in-heading">
            <span className="text-teal-950">Đón tiếp</span>
            <br />
            <span className="inline-flex items-center justify-center flex-wrap gap-2 mt-4 sm:mt-6 md:mt-8">
              <span className="text-teal-950">Thăm khám</span>
              <RotatingText
                texts={[
                  "Thông minh",
                  "Tiện lợi",
                  "Nhanh chóng",
                  "Dễ dàng",
                ]}
                mainClassName="px-2 py-2 sm:px-2 md:px-3 bg-teal-800/50 text-amber-50 overflow-hidden py-1 sm:py-1 md:py-2 justify-center rounded-lg shadow-lg"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-1 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-teal-950/50 text-balance max-w-sm sm:max-w-3xl mx-auto mb-4 sm:mb-8 leading-relaxed px-4 sm:px-0 animate-fade-in-subheading font-light">
            Tái thiết dòng chảy y tế, đem đến trải nghiệm toàn diện cùng với <p className="inline-block text-teal-950/70 font-bold">MediFlow</p>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 sm:mb-8 animate-fade-in-buttons">
            <Button
              size="lg"
              className="bg-white text-black rounded-full px-8 py-4 text-lg font-medium transition-all duration-300 hover:bg-gray-50 hover:scale-105 hover:shadow-lg group cursor-pointer relative overflow-hidden"
            >
              Đăng kí
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-4 text-lg font-medium border-border hover:bg-accent transition-all duration-200 hover:scale-105 group bg-transparent cursor-pointer"
            >
              Xem Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          {/* <div className="text-center mx-auto px-32 md:px-24 hidden sm:block sm:px-16 overflow-hidden animate-fade-in-trust">
            <p className="text-sm text-white mb-6">
              Trusted by innovative companies worldwide
            </p>
            <div className="relative overflow-hidden w-full max-w-4xl mx-auto">
              <div className="flex items-center gap-8 opacity-60 hover:opacity-80 transition-all duration-500 animate-slide-left">
                <div className="flex items-center gap-8 whitespace-nowrap">
                  <div className="text-base sm:text-lg font-semibold">
                    TechCorp
                  </div>
                  <div className="text-base sm:text-lg font-semibold">
                    InnovateLab
                  </div>
                  <div className="text-base sm:text-lg font-semibold">
                    FutureScale
                  </div>
                  <div className="text-base sm:text-lg font-semibold">
                    AutoFlow
                  </div>
                  <div className="text-base sm:text-lg font-semibold">
                    eScale
                  </div>
                  <div className="text-base sm:text-lg font-semibold">
                    DataFlow
                  </div>
                </div>
                <div className="flex items-center gap-8 whitespace-nowrap">
                  <div className="text-base sm:text-lg font-semibold">
                    TechCorp
                  </div>
                  <div className="text-base sm:text-lg font-semibold">
                    InnovateLab
                  </div>
                  <div className="text-base sm:text-lg font-semibold">
                    FutureScale
                  </div>
                  <div className="text-base sm:text-lg font-semibold">
                    AutoFlow
                  </div>
                  <div className="text-base sm:text-lg font-semibold">
                    eScale
                  </div>
                  <div className="text-base sm:text-lg font-semibold">
                    DataFlow
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Mobile Trust Indicators */}
          {/* <div className="text-center px-4 mb-8 sm:hidden overflow-hidden animate-fade-in-trust">
            <p className="text-sm text-white mb-6">
              Trusted by innovative companies worldwide
            </p>
            <div className="relative overflow-hidden w-full max-w-sm mx-auto">
 
              <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
      
              <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
              <div className="flex items-center gap-6 opacity-60 animate-slide-left-mobile">
                <div className="flex items-center gap-6 whitespace-nowrap">
                  <div className="text-sm font-semibold">TechCorp</div>
                  <div className="text-sm font-semibold">InnovateLab</div>
                  <div className="text-sm font-semibold">FutureScale</div>
                  <div className="text-sm font-semibold">AutoFlow</div>
                  <div className="text-sm font-semibold">eScale</div>
                  <div className="text-sm font-semibold">DataFlow</div>
                </div>
                <div className="flex items-center gap-6 whitespace-nowrap">
                  <div className="text-sm font-semibold">TechCorp</div>
                  <div className="text-sm font-semibold">InnovateLab</div>
                  <div className="text-sm font-semibold">FutureScale</div>
                  <div className="text-sm font-semibold">AutoFlow</div>
                  <div className="text-sm font-semibold">eScale</div>
                  <div className="text-sm font-semibold">DataFlow</div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </section>
    // </ShaderBackground>
  );
}
