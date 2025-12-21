"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface ScrollObserverProps {
  children: React.ReactNode
  className?: string
  animationClass?: string
  threshold?: number
}

export function ScrollObserver({
  children,
  className = "",
  animationClass = "animate-fade-in-up",
  threshold = 0.1,
}: ScrollObserverProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is entering viewport
            entry.target.classList.remove("animate-fade-out-down")
            entry.target.classList.add(animationClass)
          } else {
            // Element is leaving viewport
            if (entry.boundingClientRect.top < 0) {
              // Element has scrolled past (upward)
              entry.target.classList.remove(animationClass)
              entry.target.classList.add("animate-fade-out-down")
            }
          }
        })
      },
      {
        threshold,
        rootMargin: "-10% 0px -10% 0px", // Trigger when element is 10% into viewport
      },
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [animationClass, threshold])

  return (
    <div ref={elementRef} className={` ${className}`}>
      {children}
    </div>
  )
}