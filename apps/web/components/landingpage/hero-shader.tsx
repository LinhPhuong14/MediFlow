"use client"
import { memo, useEffect, useRef, useState } from "react"
import { Shader, Swirl, ChromaFlow } from "shaders/react"

function HeroShader() {
  const shaderContainerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
      const checkShaderReady = () => {
        if (shaderContainerRef.current) {
          const canvas = shaderContainerRef.current.querySelector("canvas");
          if (canvas && canvas.width > 0 && canvas.height > 0) {
            setIsLoaded(true);
            return true;
          }
        }
        return false;
      };
  
      if (checkShaderReady()) return;
  
      const intervalId = setInterval(() => {
        if (checkShaderReady()) {
          clearInterval(intervalId);
        }
      }, 100);
  
      const fallbackTimer = setTimeout(() => {
        setIsLoaded(true);
      }, 1500);
  
      return () => {
        clearInterval(intervalId);
        clearTimeout(fallbackTimer);
      };
    }, []);
  
  return (
    <div className="fixed inset-0 z-0" style={{ contain: "strict" }}>
      <div
        ref={shaderContainerRef}
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ contain: "strict" }}
      >
        <Shader className="h-full w-full">
          <Swirl
            colorA="#16adffff"
            colorB="#6ef98cff"
            speed={0.8}
            detail={0.8}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />
          <ChromaFlow
            baseColor="#67caffff"
            upColor="#4773b4ff"
            downColor="#dcf8cbff"
            leftColor="#6ef98cff"
            rightColor="#36e19aff"
            intensity={0.9}
            radius={1.8}
            momentum={25}
            maskType="alpha"
            opacity={0.97}
          />
        </Shader>
      </div>

    </div>
  )
}

export default memo(HeroShader)
