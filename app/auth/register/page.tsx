"use client";
import RegisterForm from "@/app/components/auth/registerForm";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row flex-1">
        {/* Lado izquierdo visual */}
        <div className="w-full md:w-1/2 relative bg-ebony-950 to-indigo-800 text-white p-10 overflow-hidden">
          {/* Logo arriba */}
          <button
            className="flex items-center gap-2 mb-12 cursor-pointer hover:transform hover:scale-105 transition-transform duration-300"
            onClick={() => router.push("/")}
          >
            <ShoppingBag className="w-6 h-6 text-white lg:w-8 lg:h-8" />
            <h1 className="text-2xl font-bold">CompX</h1>
          </button>

          {/* Contenedor central centrado verticalmente */}
          <div className="flex flex-col justify-center h-[calc(100%-6rem)]">
            <div className="space-y-4 max-w-md">
              <h1 className="text-4xl lg:text-5xl font-bold">
                Hola, Bienvenido!
              </h1>
              <p className="text-lg lg:text-base text-white/90">
                Créate una cuenta para gestionar tus productos, pedidos y más.
              </p>
            </div>
          </div>
        </div>

        {/* Lado derecho */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
