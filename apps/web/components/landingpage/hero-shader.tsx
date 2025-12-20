"use client"
import { memo, useEffect, useRef, useState } from "react"
import { Shader, Swirl, ChromaFlow } from "shaders/react"
import ShaderBackground from "./shader-background";

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
          <ShaderBackground>
          <ChromaFlow
            baseColor="#b3e4ffff"
            upColor="#e5d0ffff"
            downColor="#dcf8cbff"
            leftColor="#6ef9e2ff"
            rightColor="#c5faadff"
            intensity={0.9}
            radius={1.8}
            momentum={25}
            maskType="alpha"
            opacity={0.97}
          /></ShaderBackground>
        </Shader>
      </div>

    </div>
  )
}

export default memo(HeroShader)
