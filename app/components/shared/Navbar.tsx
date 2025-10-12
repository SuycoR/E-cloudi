"use client";

import React, { useState, useRef } from "react";
import { ShoppingBag, Menu, User, ShoppingCart, Search } from "lucide-react";
import Drawer from "../ui/Drawer";
import CartDrawer from "../ui/CartDrawer";
import Searchbar from "@/app/components/ui/Searchbar";
import { useCart } from "@/app/context/CartContext";
import { useSession } from "next-auth/react";
import UserMenu from "../ui/UserMenu";
import { useEffect } from "react";


const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null!);
  const { cart } = useCart();
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      console.log("Enviando user_id a Google Analytics:", session?.user?.id);
      // Enviar el user_id a Google Analytics
      if (session?.user?.id) {
        console.log("User ID encontrado:", session.user.id);
        // Asegúrate de que gtag esté definido antes de usarlo
        window.gtag('set', { user_id: session.user.id });
      } else {
        window.gtag('set', { user_id: null });
      }
    }
  }, [session]);

  return (
    <>
      <nav className="bg-ebony-950 w-full sticky top-0 left-0 z-50 shadow-lg">
        <div className="container-padding">
          <div className="flex items-center justify-between py-3 sm:py-3 lg:py-4">
            {/* Izquierda */}
            <div className="flex items-center gap-4 sm:gap-8 lg:gap-12">
              <button
                className="flex items-center gap-3 sm:gap-4 lg:gap-6 cursor-pointer"
                aria-label="Inicio"
                onClick={() => (window.location.href = "/")}
              >
                <div className="bg-white flex items-center justify-center rounded-full w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14">
                  <ShoppingBag className="text-ebony-950 w-4 h-4 sm:w-6 sm:h-6 lg:w-10 lg:h-10" />
                </div>
                <h1 className="text-white text-lg sm:text-xl lg:text-2xl font-bold">
                  CompX
                </h1>
              </button>

              <button
                className="group cursor-pointer p-2 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105"
                onClick={() => setDrawerOpen(true)}
                aria-label="Menú"
              >
                <Menu className="text-white w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10" />
              </button>
            </div>

            {/* Centro - Buscador desktop */}
            <div className="hidden lg:flex flex-1 max-w-xl px-4">
              <Searchbar />
            </div>

            {/* Derecha */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              {/* Botón búsqueda móvil */}
              <button
                className="lg:hidden flex items-center justify-center text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Buscar"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Usuario */}
              {session?.user ? (
                <button ref={buttonRef} onClick={() => setUserOpen(!userOpen)}>
                  <div className="group flex items-center gap-1 sm:gap-2 text-white text-sm sm:text-base lg:text-lg cursor-pointer p-2 sm:px-3 sm:py-2 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105 border border-transparent hover:border-white/20">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6" />
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="hidden sm:inline">Hola,</span>
                      <span>
                        {session.user.name?.split(" ")[0] || session.user.email}
                      </span>
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  className="group flex items-center gap-1 sm:gap-2 text-white text-sm sm:text-base lg:text-lg cursor-pointer p-2 sm:px-3 sm:py-2 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105 border border-transparent hover:border-white/20"
                  aria-label="Mi cuenta"
                  onClick={() => (window.location.href = "/auth/login")}
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </button>
              )}

              {/* Carrito */}
              <button
                className="group flex items-center gap-1 sm:gap-2 text-white text-sm sm:text-base lg:text-lg cursor-pointer p-2 sm:px-3 sm:py-2 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105 relative border border-transparent hover:border-white/20"
                aria-label="Mi cesta"
                onClick={() => setCartOpen(true)}
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full text-[10px] min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold border-2 border-white shadow-sm z-10">
                      {cart.reduce((sum, i) => sum + i.cantidad, 0)}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline lg:inline">Mi cesta</span>
              </button>
            </div>
          </div>

          {/* Searchbar móvil expandible */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              searchOpen ? "max-h-20 pb-4" : "max-h-0"
            }`}
          >
            <div className="px-2">
              <Searchbar />
            </div>
          </div>
        </div>
      </nav>

      {/* Cajones laterales */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <UserMenu
        isOpen={userOpen}
        onClose={() => setUserOpen(false)}
        anchorRef={buttonRef}
      />
    </>
  );
};

export default Navbar;
