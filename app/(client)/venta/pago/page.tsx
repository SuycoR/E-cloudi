"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/app/context/CheckoutContext";
import { useCart } from "@/app/context/CartContext";
import { formatPrice } from "@/app/utils/formatPrice";
import {
  X,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

// Payment method types
type PaymentMethod = "credit" | "debit" | "digital" | "cuotealo" | "efectivo";

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  icons: string[];
  description?: string;
}

const paymentOptions: PaymentOption[] = [
  {
    id: "credit",
    label: "Tarjeta de crédito",
    icons: ["💳", "visa", "mastercard", "amex"],
  },
  {
    id: "debit",
    label: "Tarjeta de débito",
    icons: ["💳", "visa", "mastercard"],
  },
  {
    id: "digital",
    label: "Billeteras Digitales",
    icons: ["📱", "paypal", "mercadopago"],
  },
  {
    id: "cuotealo",
    label: "Cuotéalo",
    icons: ["📊"],
    description: "Paga en cuotas sin tarjeta",
  },
  {
    id: "efectivo",
    label: "PagoEfectivo",
    icons: ["💵"],
    description: "Paga en agentes o bancos",
  },
];

export default function PagoPage() {
  const router = useRouter();
  const { orden, setOrden } = useCheckout();
  const { cart, clearCart } = useCart();

  // Payment state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Card form state (for credit/debit)
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cuotas, setCuotas] = useState("1");
  const [useBillingAddress, setUseBillingAddress] = useState(true);

  // Calculate totals
  const subtotal = cart.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );
  const envio = orden.costoEnvio || 0;
  const total = subtotal + envio;

  // Redirect if no delivery info
  if (!orden.direccionEnvioId && orden.metodoEnvioId !== 2) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Primero completa la información de entrega
          </h2>
          <Link href="/venta/entrega" className="text-sky-600 hover:underline">
            Ir a entrega
          </Link>
        </div>
      </div>
    );
  }

  const handleSelectPayment = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handleOpenModal = () => {
    if (!selectedMethod) return;
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isProcessing) return;
    setShowModal(false);
    setPaymentSuccess(false);
  };

  const simulatePayment = async () => {
    setIsProcessing(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Set payment success
    setPaymentSuccess(true);
    setIsProcessing(false);

    // Update order with payment method
    setOrden({
      ...orden,
      metodoPagoId:
        selectedMethod === "credit" ? 1 : selectedMethod === "debit" ? 2 : 3,
      metodoPagoNombre:
        paymentOptions.find((p) => p.id === selectedMethod)?.label || "",
      total,
    });

    // Wait a bit then redirect
    setTimeout(() => {
      clearCart();
      router.push("/venta/confirmacion");
    }, 2000);
  };

  const isCardMethod =
    selectedMethod === "credit" || selectedMethod === "debit";
  const canPay = isCardMethod
    ? cardNumber && cardName && expiryMonth && expiryYear && cvv
    : selectedMethod !== null;

  return (
    <main
      className="min-h-screen bg-gray-100 py-6 sm:py-8"
      aria-label="Paso 3: Pago"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Step Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm"
            aria-hidden="true"
          >
            3
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pago</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Payment Methods */}
          <div className="flex-1">
            <fieldset className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <legend className="sr-only">Selecciona un método de pago</legend>
              {paymentOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectPayment(option.id)}
                  aria-pressed={selectedMethod === option.id}
                  aria-label={`${option.label}${
                    option.description ? `, ${option.description}` : ""
                  }`}
                  className={clsx(
                    "w-full flex items-center gap-4 p-4 text-left transition-all border-b border-gray-100 last:border-b-0",
                    selectedMethod === option.id
                      ? "bg-sky-50 border-l-4 border-l-sky-500"
                      : "hover:bg-gray-50 border-l-4 border-l-transparent"
                  )}
                >
                  <div
                    className={clsx(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      selectedMethod === option.id
                        ? "border-sky-500 bg-sky-500"
                        : "border-gray-300"
                    )}
                    aria-hidden="true"
                  >
                    {selectedMethod === option.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {option.label}
                      </span>
                      <div className="flex gap-1" aria-hidden="true">
                        {option.id === "credit" && (
                          <>
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              VISA
                            </span>
                            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                              MC
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                              AMEX
                            </span>
                          </>
                        )}
                        {option.id === "debit" && (
                          <>
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              VISA
                            </span>
                            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                              MC
                            </span>
                          </>
                        )}
                        {option.id === "digital" && (
                          <>
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              PayPal
                            </span>
                            <span className="text-xs bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded">
                              MP
                            </span>
                          </>
                        )}
                        {option.id === "cuotealo" && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                            cuotéalo
                          </span>
                        )}
                        {option.id === "efectivo" && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                            PE
                          </span>
                        )}
                      </div>
                    </div>
                    {option.description && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {option.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </fieldset>
          </div>

          {/* Card Form (visible when card method selected) */}
          {isCardMethod && (
            <form
              className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              onSubmit={(e) => e.preventDefault()}
              role="form"
              aria-label="Formulario de datos de tarjeta"
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="cardNumber"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Número{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="cardNumber"
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 16)
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="0000 0000 0000 0000"
                    aria-required="true"
                    aria-label="Número de tarjeta de crédito o débito"
                    autoComplete="cc-number"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cuotas"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Cuotas disponibles:
                  </label>
                  <select
                    id="cuotas"
                    value={cuotas}
                    onChange={(e) => setCuotas(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    aria-label="Seleccionar número de cuotas para el pago"
                  >
                    <option value="1">Total - {formatPrice(total)}</option>
                    <option value="3">
                      3 cuotas de {formatPrice(total / 3)}
                    </option>
                    <option value="6">
                      6 cuotas de {formatPrice(total / 6)}
                    </option>
                    <option value="12">
                      12 cuotas de {formatPrice(total / 12)}
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cardName"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Nombre y Apellido como figura en la tarjeta{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="cardName"
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="NOMBRE APELLIDO"
                    aria-required="true"
                    aria-label="Nombre del titular de la tarjeta"
                    autoComplete="cc-name"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label
                      id="expiryLabel"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Fecha de Vencimiento{" "}
                      <span className="text-red-500" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <div
                      className="flex gap-2 items-center"
                      role="group"
                      aria-labelledby="expiryLabel"
                    >
                      <select
                        id="expiryMonth"
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                        className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        aria-label="Mes de vencimiento"
                        aria-required="true"
                        autoComplete="cc-exp-month"
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option
                            key={i + 1}
                            value={String(i + 1).padStart(2, "0")}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-400" aria-hidden="true">
                        /
                      </span>
                      <select
                        id="expiryYear"
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                        className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        aria-label="Año de vencimiento"
                        aria-required="true"
                        autoComplete="cc-exp-year"
                      >
                        <option value="">AA</option>
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i} value={String(25 + i)}>
                            {25 + i}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="w-24">
                    <label
                      htmlFor="cvv"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Código de Seguridad{" "}
                      <span className="text-red-500" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id="cvv"
                      type="text"
                      inputMode="numeric"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      placeholder="CVV"
                      aria-required="true"
                      aria-label="Código de seguridad CVV de la tarjeta"
                      autoComplete="cc-csc"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="billing"
                    checked={useBillingAddress}
                    onChange={(e) => setUseBillingAddress(e.target.checked)}
                    className="mt-1 w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                    aria-describedby="billing-descripcion"
                  />
                  <label
                    htmlFor="billing"
                    id="billing-descripcion"
                    className="text-sm text-gray-600"
                  >
                    La dirección de la factura de la tarjeta es{" "}
                    <span className="font-medium">
                      {orden.direccionResumen || "la misma de entrega"}
                    </span>
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Pay Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleOpenModal}
            disabled={!canPay}
            aria-label={
              canPay
                ? `Pagar ${formatPrice(total)}`
                : "Complete los datos de pago para continuar"
            }
            aria-disabled={!canPay}
            className={clsx(
              "px-12 py-3 rounded-full font-semibold text-white transition-all text-lg",
              canPay
                ? "bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-xl"
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            Pagar {formatPrice(total)}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 space-y-4">
          {/* Identification Summary */}
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <span className="font-semibold text-gray-900">
                  Identificación
                </span>
              </div>
              <Link
                href="/venta/identificacion"
                className="text-sky-600 hover:underline text-sm font-medium"
              >
                Editar
              </Link>
            </div>
            <div className="text-sm text-gray-600 pl-8">
              <p>
                {orden.email} • {orden.nombre} {orden.apellido}
              </p>
            </div>
          </div>

          {/* Delivery Summary */}
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <span className="font-semibold text-gray-900">Entrega</span>
              </div>
              <Link
                href="/venta/entrega"
                className="text-sky-600 hover:underline text-sm font-medium"
              >
                Editar
              </Link>
            </div>
            <div className="text-sm text-gray-600 pl-8">
              <p>{orden.direccionResumen}</p>
              <p>
                {orden.fechaEntrega} • {orden.franjaEntrega}
              </p>
              <p>Destinatario: {orden.destinatario}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="presentation"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            {!paymentSuccess && !isProcessing && (
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar ventana de confirmación de pago"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}

            {isProcessing ? (
              <div
                className="py-12 text-center"
                role="status"
                aria-live="polite"
              >
                <Loader2
                  className="w-16 h-16 text-sky-500 animate-spin mx-auto mb-4"
                  aria-hidden="true"
                />
                <h3
                  id="modal-title"
                  className="text-xl font-semibold text-gray-900 mb-2"
                >
                  Procesando pago...
                </h3>
                <p id="modal-description" className="text-gray-500">
                  Por favor espera un momento
                </p>
                <span className="sr-only">
                  Procesando su pago, por favor espere
                </span>
              </div>
            ) : paymentSuccess ? (
              <div
                className="py-12 text-center"
                role="status"
                aria-live="assertive"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2
                    className="w-12 h-12 text-green-500"
                    aria-hidden="true"
                  />
                </div>
                <h3
                  id="modal-title"
                  className="text-xl font-semibold text-gray-900 mb-2"
                >
                  ¡Pago exitoso!
                </h3>
                <p id="modal-description" className="text-gray-500 mb-4">
                  Tu pedido ha sido confirmado
                </p>
                <p
                  className="text-2xl font-bold text-gray-900"
                  aria-label={`Total pagado: ${formatPrice(total)}`}
                >
                  {formatPrice(total)}
                </p>
                <span className="sr-only">
                  Pago completado exitosamente. Será redirigido a la página de
                  confirmación.
                </span>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck
                      className="w-8 h-8 text-sky-500"
                      aria-hidden="true"
                    />
                  </div>
                  <h3
                    id="modal-title"
                    className="text-xl font-semibold text-gray-900"
                  >
                    Confirmar pago
                  </h3>
                </div>

                <div
                  id="modal-description"
                  className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2"
                  aria-label="Resumen del pago"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Método de pago</span>
                    <span className="font-medium text-gray-900">
                      {
                        paymentOptions.find((p) => p.id === selectedMethod)
                          ?.label
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span className="text-gray-900">{formatPrice(envio)}</span>
                  </div>
                  <hr className="border-gray-200" aria-hidden="true" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900">Total a pagar</span>
                    <span className="text-xl text-sky-600">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    aria-label="Cancelar y volver a editar los datos de pago"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={simulatePayment}
                    className="flex-1 py-3 px-4 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors"
                    aria-label={`Confirmar pago de ${formatPrice(total)}`}
                  >
                    Pagar ahora
                  </button>
                </div>

                <p
                  className="text-xs text-center text-gray-400 mt-4"
                  aria-hidden="true"
                >
                  🔒 Pago seguro y encriptado
                </p>
                <span className="sr-only">
                  Su pago está protegido con encriptación de seguridad
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
