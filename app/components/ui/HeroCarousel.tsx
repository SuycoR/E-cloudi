"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSlide {
  id: number;
  image: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

const defaultSlides: HeroSlide[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80",
    title: "Nueva Colección",
    subtitle: "Descubre las últimas tendencias",
    ctaText: "Ver más",
    ctaLink: "/categoria/1/1",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80",
    title: "Ofertas Especiales",
    subtitle: "Hasta 50% de descuento",
    ctaText: "Comprar ahora",
    ctaLink: "/productos",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80",
    title: "Estilo Único",
    subtitle: "Encuentra tu look perfecto",
    ctaText: "Explorar",
    ctaLink: "/categoria/1/1",
  },
];

interface HeroCarouselProps {
  slides?: HeroSlide[];
  autoplayInterval?: number;
}

export default function HeroCarousel({
  slides = defaultSlides,
  autoplayInterval = 5000,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (slides.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoplayInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slides.length, autoplayInterval]);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoplayInterval);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    resetInterval();
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    resetInterval();
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    resetInterval();
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <section
      className="w-full"
      aria-label="Carrusel de promociones destacadas"
      role="region"
    >
      {/* Image Carousel */}
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-roledescription="carrusel"
        aria-label={`Imagen ${currentIndex + 1} de ${slides.length}: ${
          currentSlide.title || "Promoción"
        }`}
      >
        {/* Slides Container */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          aria-live="polite"
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative w-full flex-shrink-0 aspect-[21/9] min-h-[200px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[450px]"
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${index + 1} de ${slides.length}: ${
                slide.title || "Imagen promocional"
              }`}
              aria-hidden={index !== currentIndex}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-gray-100 rounded-2xl"
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
                role="img"
                aria-label={
                  slide.title
                    ? `Imagen de ${slide.title}`
                    : "Imagen promocional de ecloudi"
                }
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              aria-label={`Ir a diapositiva anterior: ${
                slides[(currentIndex - 1 + slides.length) % slides.length]
                  .title || "Anterior"
              }`}
              className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/90 rounded-full shadow-lg 
                         transition-all duration-300 hover:bg-white hover:scale-110 z-10 border border-gray-200
                         ${isHovered ? "opacity-100" : "opacity-70"}`}
            >
              <ChevronLeft
                className="w-5 h-5 text-gray-800"
                aria-hidden="true"
              />
            </button>

            <button
              onClick={goToNext}
              aria-label={`Ir a siguiente diapositiva: ${
                slides[(currentIndex + 1) % slides.length].title || "Siguiente"
              }`}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/90 rounded-full shadow-lg 
                         transition-all duration-300 hover:bg-white hover:scale-110 z-10 border border-gray-200
                         ${isHovered ? "opacity-100" : "opacity-70"}`}
            >
              <ChevronRight
                className="w-5 h-5 text-gray-800"
                aria-hidden="true"
              />
            </button>
          </>
        )}
      </div>

      {/* Content Below Image */}
      <div className="text-center py-6 sm:py-8">
        {currentSlide.title && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {currentSlide.title}
          </h2>
        )}
        {currentSlide.subtitle && (
          <p className="text-gray-600 text-base sm:text-lg mb-5">
            {currentSlide.subtitle}
          </p>
        )}
        {currentSlide.ctaText && currentSlide.ctaLink && (
          <a
            href={currentSlide.ctaLink}
            className="inline-flex items-center px-8 py-3 bg-sky-500 text-white font-semibold rounded-full 
                     hover:bg-sky-600 transition-colors duration-300 text-sm sm:text-base"
            aria-label={`${currentSlide.ctaText}: ${
              currentSlide.title || "Ver promoción"
            }`}
          >
            {currentSlide.ctaText}
          </a>
        )}

        {/* Dots Indicator */}
        {slides.length > 1 && (
          <nav
            className="flex justify-center gap-2 mt-5"
            aria-label="Navegación del carrusel"
          >
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Ir a diapositiva ${index + 1}: ${
                  slide.title || "Promoción"
                }`}
                aria-current={index === currentIndex ? "true" : undefined}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300
                           ${
                             index === currentIndex
                               ? "bg-sky-500"
                               : "bg-gray-300 hover:bg-gray-400"
                           }`}
              />
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
