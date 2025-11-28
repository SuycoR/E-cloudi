"use client";
import { Gift, ArrowRight } from "lucide-react";
import Link from "next/link";

interface WelcomeDiscountBannerProps {
  discount?: string;
  title?: string;
  subtitle?: string;
  linkText?: string;
  linkHref?: string;
}

export default function WelcomeDiscountBanner({
  discount = "10%",
  title = "Descuento Bienvenida",
  subtitle = "Especial para nuevos compradores",
  linkText = "Obtener descuento",
  linkHref = "/auth/register",
}: WelcomeDiscountBannerProps) {
  return (
    <div className="w-full bg-gradient-to-r from-ebony-600 via-ebony-700 to-ebony-800 rounded-2xl overflow-hidden">
      <div className="container-padding py-5 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side - Icon and Text */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <h3 className="text-white font-bold text-lg sm:text-xl">
                  {title}
                </h3>
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  {discount} OFF
                </span>
              </div>
              <p className="text-white/80 text-sm sm:text-base mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Right side - CTA Button */}
          <Link
            href={linkHref}
            className="flex items-center gap-2 bg-white text-ebony-800 font-semibold px-5 py-2.5 rounded-full 
                     hover:bg-gray-100 transition-all duration-300 hover:scale-105 text-sm sm:text-base group"
          >
            {linkText}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
