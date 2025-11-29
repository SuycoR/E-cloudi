"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/app/context/CheckoutContext";
import { useCart } from "@/app/context/CartContext";
import { formatPrice } from "@/app/utils/formatPrice";
import Link from "next/link";
import clsx from "clsx";

export default function IdentificacionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { orden, setOrden } = useCheckout();
  const { cart } = useCart();

  // Form state
  const [email, setEmail] = useState(orden.email || "");
  const [nombre, setNombre] = useState(orden.nombre || "");
  const [apellido, setApellido] = useState(orden.apellido || "");
  const [tipoDocumento, setTipoDocumento] = useState(
    orden.tipoDocumento || "DNI"
  );
  const [numeroDocumento, setNumeroDocumento] = useState(
    orden.numeroDocumento || ""
  );
  const [telefono, setTelefono] = useState(orden.telefono || "");
  const [aceptaTerminos, setAceptaTerminos] = useState(
    orden.aceptaTerminos || false
  );

  // Calculate totals
  const subtotal = cart.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );
  const itemsCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  // Pre-fill from session
  useEffect(() => {
    if (session?.user) {
      if (session.user.email && !email) setEmail(session.user.email);
      if (session.user.name && !nombre) {
        const parts = session.user.name.split(" ");
        setNombre(parts[0] || "");
        setApellido(parts.slice(1).join(" ") || "");
      }
      if (session.user.id) {
        setOrden((prev) => ({ ...prev, usuarioId: session.user!.id || null }));
      }
    }
  }, [session]);

  const isFormValid =
    email &&
    nombre &&
    apellido &&
    numeroDocumento &&
    telefono &&
    aceptaTerminos;

  const handleContinue = () => {
    if (!isFormValid) return;

    setOrden({
      ...orden,
      email,
      nombre,
      apellido,
      tipoDocumento,
      numeroDocumento,
      telefono,
      aceptaTerminos,
      subtotal,
    });

    router.push("/venta/entrega");
  };

  // Redirect if cart is empty
  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Tu carrito está vacío
          </h2>
          <Link href="/" className="text-sky-600 hover:underline">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen bg-white py-6 sm:py-8"
      aria-label="Paso 1: Identificación del cliente"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Step Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm"
            aria-hidden="true"
          >
            1
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Identificación
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section */}
          <form
            className="flex-1 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleContinue();
            }}
            role="form"
            aria-label="Formulario de identificación"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo{" "}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-gray-50"
                placeholder="tu@email.com"
                aria-required="true"
                aria-label="Correo electrónico"
                autoComplete="email"
              />
            </div>

            {/* Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nombre{" "}
                  <span className="text-red-500" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-gray-50"
                  placeholder="Tu nombre"
                  aria-required="true"
                  aria-label="Nombre"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label
                  htmlFor="apellido"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Apellido{" "}
                  <span className="text-red-500" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="apellido"
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-gray-50"
                  placeholder="Tu apellido"
                  aria-required="true"
                  aria-label="Apellido"
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* Document Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="tipoDocumento"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tipo del documento{" "}
                  <span className="text-red-500" aria-hidden="true">
                    *
                  </span>
                </label>
                <select
                  id="tipoDocumento"
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-gray-50"
                  aria-required="true"
                  aria-label="Tipo de documento de identidad"
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">Carnet de Extranjería</option>
                  <option value="RUC">RUC</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="numeroDocumento"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Documento{" "}
                  <span className="text-red-500" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="numeroDocumento"
                  type="text"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-gray-50"
                  placeholder="Número de documento"
                  aria-required="true"
                  aria-label="Número de documento"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="telefono"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Telefono/Movil{" "}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-gray-50"
                placeholder="+51 999 999 999"
                aria-required="true"
                aria-label="Número de teléfono o celular"
                autoComplete="tel"
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terminos"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="mt-1 w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                aria-required="true"
                aria-describedby="terminos-descripcion"
              />
              <label
                htmlFor="terminos"
                id="terminos-descripcion"
                className="text-sm text-gray-600"
              >
                He leido y acepto los{" "}
                <a
                  href="/terminos"
                  className="text-sky-600 hover:underline"
                  aria-label="Leer términos y condiciones (abre en nueva pestaña)"
                >
                  Terminos y Condiciones y Politicas de privacidad
                </a>
              </label>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={!isFormValid}
              aria-label={
                isFormValid
                  ? "Continuar al paso de entrega"
                  : "Complete todos los campos requeridos para continuar"
              }
              aria-disabled={!isFormValid}
              className={clsx(
                "w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-white transition-all",
                isFormValid
                  ? "bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 cursor-not-allowed"
              )}
            >
              Ir para la Entrega
            </button>
          </form>

          {/* Summary Sidebar (visible on lg+) */}
          <aside
            className="hidden lg:block w-72 flex-shrink-0"
            role="complementary"
            aria-label="Resumen del pedido"
          >
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Resumen del pedido
              </h3>
              <div className="space-y-3 text-sm" aria-live="polite">
                <div className="flex justify-between text-gray-600">
                  <span>{itemsCount} producto(s)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <hr className="border-gray-200" aria-hidden="true" />
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Saved Info Preview (if form is filled) */}
        {isFormValid && (
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <span className="font-semibold text-gray-900">
                  Identificación
                </span>
              </div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-sky-600 hover:underline text-sm font-medium"
              >
                Editar
              </button>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{email}</p>
              <p>
                {nombre} {apellido}
              </p>
              <p>{telefono}</p>
              <p>{numeroDocumento}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
