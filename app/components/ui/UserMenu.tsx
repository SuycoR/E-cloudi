import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { DrawerProps } from "@/app/types/props";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { User, MapPin, Package, CreditCard, LogOut } from "lucide-react";

const UserMenu = ({ isOpen, onClose, anchorRef }: DrawerProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleSignOut = async () => {
    signOut();
  };

  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const menuWidth = 256; // w-64

      // Evitar desbordamiento a la derecha
      const maxLeft = window.innerWidth - menuWidth - 16; // 16px margen derecho
      const calculatedLeft = Math.min(rect.left, maxLeft);

      setPosition({
        top: rect.bottom + 8, // debajo del botón + 8px
        left: calculatedLeft,
      });
    }
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Overlay para cerrar al hacer click fuera */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Menú de usuario */}
      <div
        ref={menuRef}
        className="absolute bg-white w-64 max-w-full rounded-lg shadow-xl border border-gray-200 p-4"
        style={{ top: position.top, left: position.left }}
      >
        <div className="flex flex-col">
          <div className="text-gray-800 font-semibold">¡Bienvenido!</div>
          <hr className="my-2 border-t border-gray-200" />

          <Link
            href="/profile/mi-perfil"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer w-full"
            onClick={onClose}
          >
            <User size={18} />
            <span>Mi perfil</span>
          </Link>

          <Link
            href="/profile/direcciones"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer w-full"
            onClick={onClose}
          >
            <MapPin size={18} />
            <span>Mis direcciones</span>
          </Link>

          <Link
            href="/profile/pedidos"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer w-full"
            onClick={onClose}
          >
            <Package size={18} />
            <span>Mis pedidos</span>
          </Link>

          <Link
            href="/profile/metodo-pago"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer w-full"
            onClick={onClose}
          >
            <CreditCard size={18} />
            <span>Mis métodos de pago</span>
          </Link>
          

          <hr className="my-2 border-t border-gray-200" />

          <button
            className="flex items-center gap-2 p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
            onClick={handleSignOut}
          >
            <LogOut size={18} className="text-red-600" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserMenu;
