"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?:
    | "fade-up"
    | "fade-in"
    | "slide-left"
    | "slide-right"
    | "scale"
    | "blur";
  delay?: number; // ms
  duration?: number; // ms
  threshold?: number; // 0-1
  once?: boolean; // Solo animar una vez
  stagger?: number; // Delay entre hijos (ms)
}

/**
 * AnimatedSection - Wrapper para animaciones de entrada
 *
 * Usa Intersection Observer para detectar cuando el elemento entra en el viewport
 * y aplica animaciones CSS suaves.
 *
 * Heurísticas de Nielsen:
 * - #4 Consistencia y estándares: Animaciones consistentes en toda la app
 * - #8 Diseño estético y minimalista: Animaciones sutiles que no distraen
 */
export default function AnimatedSection({
  children,
  className = "",
  animation = "fade-up",
  delay = 0,
  duration = 600,
  threshold = 0.1,
  once = true,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Si ya animó y once=true, no observar más
    if (hasAnimated && once) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            setHasAnimated(true);
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: "50px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, once, hasAnimated]);

  // Clases de animación inicial (antes de ser visible)
  const getInitialClasses = () => {
    switch (animation) {
      case "fade-up":
        return "opacity-0 translate-y-8";
      case "fade-in":
        return "opacity-0";
      case "slide-left":
        return "opacity-0 -translate-x-8";
      case "slide-right":
        return "opacity-0 translate-x-8";
      case "scale":
        return "opacity-0 scale-95";
      case "blur":
        return "opacity-0 blur-sm";
      default:
        return "opacity-0";
    }
  };

  // Clases cuando es visible
  const getVisibleClasses = () => {
    return "opacity-100 translate-y-0 translate-x-0 scale-100 blur-0";
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${
        isVisible ? getVisibleClasses() : getInitialClasses()
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * StaggeredList - Lista con animación escalonada para hijos
 */
interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  animation?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale";
  staggerDelay?: number;
  duration?: number;
  threshold?: number;
}

export function StaggeredList({
  children,
  className = "",
  animation = "fade-up",
  staggerDelay = 100,
  duration = 500,
  threshold = 0.1,
}: StaggeredListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "50px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  const getAnimationClasses = (visible: boolean) => {
    if (!visible) {
      switch (animation) {
        case "fade-up":
          return "opacity-0 translate-y-6";
        case "fade-in":
          return "opacity-0";
        case "slide-left":
          return "opacity-0 -translate-x-6";
        case "slide-right":
          return "opacity-0 translate-x-6";
        case "scale":
          return "opacity-0 scale-90";
        default:
          return "opacity-0";
      }
    }
    return "opacity-100 translate-y-0 translate-x-0 scale-100";
  };

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`transition-all ease-out ${getAnimationClasses(
            isVisible
          )}`}
          style={{
            transitionDuration: `${duration}ms`,
            transitionDelay: isVisible ? `${index * staggerDelay}ms` : "0ms",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
