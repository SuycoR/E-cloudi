'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, MapPin, Package, CreditCard, LogOut } from 'lucide-react';
import { signOut } from "next-auth/react";


const ProfileSidebar = () => {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: '/profile/mi-perfil',
      label: 'Mi perfil',
      icon: User,
    },
    {
      href: '/profile/direcciones',
      label: 'Mis direcciones',
      icon: MapPin,
    },
    {
      href: '/profile/pedidos',
      label: 'Mis pedidos',
      icon: Package,
    },
    {
      href: '/profile/metodo-pago',
      label: 'Mis métodos de pago',
      icon: CreditCard,
    },
  ];

  const handleLogout = () => {
    signOut();
    console.log('Cerrar sesión');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Mi cuenta</h2>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-ebony-50 text-ebony-700 border border-blue-100'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-ebony-700' : 'text-gray-500'} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <hr className="my-6 border-gray-200" />

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-3 w-full text-left rounded-lg transition-colors text-red-600 hover:bg-red-50"
      >
        <LogOut size={20} className="text-red-600" />
        <span className="font-medium">Cerrar sesión</span>
      </button>
    </div>
  );
};

export default ProfileSidebar;