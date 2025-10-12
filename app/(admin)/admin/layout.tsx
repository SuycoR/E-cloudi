import "@/app/globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ProductProvider } from "@/app/context/ProductContext"; // Ajusta la ruta según tu proyecto
import { PromotionProvider } from "@/app/context/PromotionContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PromotionProvider>
      <ProductProvider>
        <div
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
        >
          {/* Navbar admin */}
          <header className="bg-white border-b shadow-sm py-5 flex items-center justify-around px-4 ">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">🛒 CompX</span>
            </div>
            <div className="hidden md:block text-lg font-medium text-gray-600">
              Panel de administrador
            </div>
            <nav className="hidden sm:block space-x-4">
              <Link
                href="/admin/add-products"
                className="text-blue-600 hover:underline"
              >
                ➕ Agregar producto
              </Link>
              <Link
                href="/admin/add-promotions"
                className="text-green-700 hover:underline"
              >
                🎉 Crear promoción
              </Link>
            </nav>
          </header>

          <main>{children}</main>
        </div>
      </ProductProvider>
    </PromotionProvider>
  );
}
