"use client";
import {
  RefreshCw,
  Shield,
  Truck,
  CreditCard,
  HeadphonesIcon,
  Award,
} from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const defaultFeatures: Feature[] = [
  {
    icon: <RefreshCw className="w-7 h-7 sm:w-8 sm:h-8" />,
    title: "Devolución fácil",
    description: "30 días para devolver",
  },
  {
    icon: <Shield className="w-7 h-7 sm:w-8 sm:h-8" />,
    title: "Pago seguro",
    description: "Protección garantizada",
  },
  {
    icon: <Truck className="w-7 h-7 sm:w-8 sm:h-8" />,
    title: "Envío rápido",
    description: "En todo el país",
  },
  {
    icon: <CreditCard className="w-7 h-7 sm:w-8 sm:h-8" />,
    title: "Múltiples pagos",
    description: "Tarjetas y más",
  },
  {
    icon: <HeadphonesIcon className="w-7 h-7 sm:w-8 sm:h-8" />,
    title: "Soporte 24/7",
    description: "Siempre disponibles",
  },
  {
    icon: <Award className="w-7 h-7 sm:w-8 sm:h-8" />,
    title: "Calidad premium",
    description: "Productos originales",
  },
];

interface FeaturesSectionProps {
  features?: Feature[];
}

export default function FeaturesSection({
  features = defaultFeatures,
}: FeaturesSectionProps) {
  return (
    <section className="py-10 sm:py-12 bg-white border-t border-b border-gray-100">
      <div className="container-padding">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group"
            >
              {/* Icon Container */}
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-ebony-50 flex items-center justify-center mb-3
                           text-ebony-700 group-hover:bg-ebony-100 group-hover:scale-110 
                           transition-all duration-300"
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-500 text-xs sm:text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
