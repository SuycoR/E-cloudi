import React, { createContext, useContext, useState, ReactNode } from "react";

// Puedes importar los tipos reales si los tienes definidos en /types
// import { MetodoPago } from "@/app/types/metodoPago";
// import { Direccion } from "@/app/types/direccion";
// import { MetodoEnvio } from "@/app/types/metodoEnvio";

interface Orden {
  usuarioId: string | null; // id del usuario (puedes obtenerlo de la session)
  metodoPagoId: number | null;
  direccionEnvioId: number | null;
  metodoEnvioId: number | null;
  estadoOrdenId: number | null;
  subtotal: number;
  costoEnvio: number;
  total?: number; // opcional, se puede calcular con un trigger maybe
}

interface CheckoutContextProps {
  orden: Orden;
  setOrden: (orden: Orden) => void;
}

const CheckoutContext = createContext<CheckoutContextProps | undefined>(undefined);

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error("useCheckout debe usarse dentro de un CheckoutProvider");
  return context;
};

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const [orden, setOrden] = useState<Orden>({
    usuarioId: null,
    metodoPagoId: null,
    direccionEnvioId: null,
    metodoEnvioId: null,
    estadoOrdenId: null,
    subtotal: 0,
    costoEnvio: 0,
    total: 0, // puedes calcularlo más adelante
  });

  return (
    <CheckoutContext.Provider value={{ orden, setOrden }}>
      {children}
    </CheckoutContext.Provider>
  );
};
