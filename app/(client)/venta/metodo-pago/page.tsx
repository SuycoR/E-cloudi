"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CreditCard,
  Wallet,
  Smartphone,
  PiggyBank,
  CheckCircle2,
  X,
  Truck,
  MapPin,
  User,
  Calendar,
} from "lucide-react";
import { useCheckout } from "@/app/context/CheckoutContext";
import { useCart } from "@/app/context/CartContext";
import { formatPrice } from "@/app/utils/formatPrice";

type DeliveryOption = "delivery" | "pickup";
type PaymentMethodId = "credit" | "debit" | "wallet" | "installments" | "cash";

interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  description: string;
  icon: typeof CreditCard;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "credit",
    label: "Tarjeta de crédito",
    description: "Visa, MasterCard, American Express",
    icon: CreditCard,
  },
  {
    id: "debit",
    label: "Tarjeta de débito",
    description: "Visa, Maestro, Cirrus",
    icon: CreditCard,
  },
  {
    id: "wallet",
    label: "Billeteras digitales",
    description: "Yape, Plin, Tunki",
    icon: Wallet,
  },
  {
    id: "installments",
    label: "Cuotéalo",
    description: "Financia tus compras sin tarjeta",
    icon: Smartphone,
  },
  {
    id: "cash",
    label: "PagoEfectivo",
    description: "Genera un código y paga en efectivo",
    icon: PiggyBank,
  },
];

const METHOD_ID_MAP: Record<PaymentMethodId, number> = {
  credit: 1,
  debit: 2,
  wallet: 3,
  installments: 4,
  cash: 5,
};

const METHOD_LABEL_MAP: Record<PaymentMethodId, string> = {
  credit: "Tarjeta de crédito",
  debit: "Tarjeta de débito",
  wallet: "Billeteras digitales",
  installments: "Cuotéalo",
  cash: "PagoEfectivo",
};

const WALLET_OPTIONS = [
  { value: "yape", label: "Yape" },
  { value: "plin", label: "Plin" },
  { value: "tunki", label: "Tunki" },
];

function formatDeliveryDateLabel(value: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const formatted = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  subtotal: number;
  shipping: number;
  total: number;
  customerName: string;
  onSimulate: (result: { method: PaymentMethodId; last4?: string }) => void;
}

function PaymentModal({
  open,
  onClose,
  subtotal,
  shipping,
  total,
  customerName,
  onSimulate,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodId>("credit");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState(customerName);
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [installments, setInstallments] = useState("total");
  const [walletOption, setWalletOption] = useState("yape");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setProcessing(false);
      setSuccess(false);
      setError(null);
      setSelectedMethod("credit");
      setInstallments("total");
      setWalletOption("yape");
    }
  }, [open]);

  if (!open) return null;

  const requiresCardFields =
    selectedMethod === "credit" ||
    selectedMethod === "debit" ||
    selectedMethod === "installments";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (requiresCardFields) {
      const validCardNumber = cardNumber.replace(/\s+/g, "").length >= 13;
      const filled =
        cardName.trim() &&
        expiryMonth.length === 2 &&
        expiryYear.length === 2 &&
        cvv.length >= 3;
      if (!validCardNumber || !filled) {
        setError("Completa los datos de la tarjeta para continuar.");
        return;
      }
    }

    setError(null);
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onSimulate({
          method: selectedMethod,
          last4: cardNumber.slice(-4) || undefined,
        });
      }, 900);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-8">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Cerrar"
          disabled={processing}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid gap-8 p-8 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">
                  Pago
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  Elige tu método preferido
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {PAYMENT_METHODS.map(({ id, label, description, icon: Icon }) => {
                const isActive = selectedMethod === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedMethod(id)}
                    className={clsx(
                      "w-full rounded-xl border px-4 py-3 text-left transition-all flex items-start gap-3",
                      isActive
                        ? "border-red-500 bg-red-50 shadow-md"
                        : "border-gray-200 hover:border-red-300"
                    )}
                  >
                    <span
                      className={clsx(
                        "mt-1 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                        isActive ? "border-red-600" : "border-gray-300"
                      )}
                    >
                      {isActive && (
                        <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                      )}
                    </span>
                    <Icon
                      className={clsx(
                        "h-5 w-5 mt-0.5",
                        isActive ? "text-red-600" : "text-gray-400"
                      )}
                    />
                    <span>
                      <span className="block text-sm font-semibold text-gray-900">
                        {label}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-gray-50 rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                Resumen de pago
              </span>
              <div className="text-right text-xs text-gray-500">
                <p>Subtotal: {formatPrice(subtotal)}</p>
                <p>Envío: {formatPrice(shipping)}</p>
                <p className="font-semibold text-gray-900">
                  Total a pagar: {formatPrice(total)}
                </p>
              </div>
            </div>

            {!success && (
              <div className="space-y-4">
                {requiresCardFields && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase">
                        Número
                      </label>
                      <input
                        value={cardNumber}
                        onChange={(event) =>
                          setCardNumber(
                            event.target.value
                              .replace(/[^0-9\s]/g, "")
                              .slice(0, 23)
                          )
                        }
                        placeholder="XXXX XXXX XXXX XXXX"
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                        inputMode="numeric"
                        autoComplete="cc-number"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase">
                        Nombre y apellido como figura en la tarjeta
                      </label>
                      <input
                        value={cardName}
                        onChange={(event) => setCardName(event.target.value)}
                        placeholder="Nombre del titular"
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                        autoComplete="cc-name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">
                          Fecha de vencimiento
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            value={expiryMonth}
                            onChange={(event) =>
                              setExpiryMonth(
                                event.target.value
                                  .replace(/[^0-9]/g, "")
                                  .slice(0, 2)
                              )
                            }
                            placeholder="MM"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                            inputMode="numeric"
                          />
                          <span className="text-gray-400">/</span>
                          <input
                            value={expiryYear}
                            onChange={(event) =>
                              setExpiryYear(
                                event.target.value
                                  .replace(/[^0-9]/g, "")
                                  .slice(0, 2)
                              )
                            }
                            placeholder="AA"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                            inputMode="numeric"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">
                          Código de seguridad
                        </label>
                        <input
                          value={cvv}
                          onChange={(event) =>
                            setCvv(
                              event.target.value
                                .replace(/[^0-9]/g, "")
                                .slice(0, 4)
                            )
                          }
                          placeholder="CVV"
                          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase">
                        Cuotas disponibles
                      </label>
                      <select
                        value={installments}
                        onChange={(event) =>
                          setInstallments(event.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                      >
                        <option value="total">
                          Total - {formatPrice(total)}
                        </option>
                        <option value="3">3 cuotas sin interés</option>
                        <option value="6">6 cuotas sin interés</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedMethod === "wallet" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Selecciona tu billetera
                    </label>
                    <select
                      value={walletOption}
                      onChange={(event) => setWalletOption(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                    >
                      {WALLET_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-gray-500">
                      Te mostraremos un código QR para que completes el pago en
                      tu app favorita.
                    </p>
                  </div>
                )}

                {selectedMethod === "cash" && (
                  <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-800">
                    Generaremos un código PagoEfectivo y lo enviaremos a tu
                    correo junto con las instrucciones para pagar en bancos o
                    agentes autorizados.
                  </div>
                )}

                {error && (
                  <p className="text-xs font-semibold text-red-600">{error}</p>
                )}
              </div>
            )}

            {success ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-green-50 p-6 text-center text-sm text-green-700">
                <CheckCircle2 className="h-8 w-8" />
                <p>Pago simulado con éxito. Estamos preparando tu resumen.</p>
              </div>
            ) : (
              <button
                type="submit"
                disabled={processing}
                className={clsx(
                  "w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white shadow-lg transition-all",
                  processing ? "opacity-70" : "hover:bg-red-700 hover:shadow-xl"
                )}
              >
                {processing ? "Procesando..." : "Confirmar pago"}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function MetodoPagoPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart } = useCart();
  const { orden, setOrden } = useCheckout();

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [cart]
  );

  const initialDeliveryMode: DeliveryOption =
    orden.metodoEnvioId === 2 ? "pickup" : "delivery";
  const [deliveryMode, setDeliveryMode] =
    useState<DeliveryOption>(initialDeliveryMode);
  const [shippingCost] = useState(() =>
    typeof orden.costoEnvio === "number" ? orden.costoEnvio : 95
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    () =>
      orden.direccionResumen ||
      (initialDeliveryMode === "pickup"
        ? "Recojo en tienda - StyleHub San Isidro"
        : "")
  );
  const [recipient, setRecipient] = useState(
    () => orden.destinatario || session?.user?.name || ""
  );
  const [deliveryDate, setDeliveryDate] = useState(
    () => orden.fechaEntrega || new Date().toISOString().split("T")[0]
  );
  const [deliveryWindow, setDeliveryWindow] = useState(
    () => orden.franjaEntrega || "08:00 - 21:00"
  );
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fullNameFromSession = session?.user?.name || "";
  const defaultFirstName =
    orden.nombre || fullNameFromSession.split(" ")[0] || "";
  const defaultLastName =
    orden.apellido || fullNameFromSession.split(" ").slice(1).join(" ") || "";

  const [identificacion, setIdentificacion] = useState({
    email: orden.email || session?.user?.email || "",
    nombre: defaultFirstName,
    apellido: defaultLastName,
    tipoDocumento: orden.tipoDocumento || "DNI",
    numeroDocumento: orden.numeroDocumento || "",
    telefono: orden.telefono || "",
    aceptaTerminos: orden.aceptaTerminos ?? false,
  });

  const [identificacionCompletada, setIdentificacionCompletada] = useState(
    Boolean(orden.email && orden.aceptaTerminos)
  );

  const identificationValid =
    identificacion.email.trim() &&
    identificacion.nombre.trim() &&
    identificacion.apellido.trim() &&
    identificacion.tipoDocumento.trim() &&
    identificacion.numeroDocumento.trim() &&
    identificacion.telefono.trim() &&
    identificacion.aceptaTerminos;

  const effectiveShipping = deliveryMode === "delivery" ? shippingCost : 0;
  const total = subtotal + effectiveShipping;

  const stepTwoValid =
    (deliveryMode === "pickup" || deliveryAddress.trim().length > 4) &&
    recipient.trim().length > 2;

  useEffect(() => {
    if (!cart.length) {
      router.prefetch("/venta/carro-compras");
    }
  }, [cart.length, router]);

  useEffect(() => {
    if (deliveryMode === "pickup") {
      setDeliveryAddress((prev) =>
        prev && prev.toLowerCase().includes("recojo")
          ? prev
          : "Recojo en tienda - StyleHub San Isidro"
      );
    }
  }, [deliveryMode]);

  useEffect(() => {
    if (!session?.user) return;
    const nameParts = session.user.name ? session.user.name.split(" ") : [];
    setIdentificacion((prev) => ({
      ...prev,
      email: prev.email || session.user?.email || "",
      nombre: prev.nombre || nameParts[0] || "",
      apellido: prev.apellido || nameParts.slice(1).join(" ") || "",
    }));

    if (!recipient.trim() && session.user.name) {
      setRecipient(session.user.name);
    }
  }, [session, recipient]);

  const handleIdentificationSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!identificationValid) return;
    setIdentificacionCompletada(true);
    setOrden((prev) => ({
      ...prev,
      email: identificacion.email.trim(),
      nombre: identificacion.nombre.trim(),
      apellido: identificacion.apellido.trim(),
      tipoDocumento: identificacion.tipoDocumento,
      numeroDocumento: identificacion.numeroDocumento.trim(),
      telefono: identificacion.telefono.trim(),
      aceptaTerminos: identificacion.aceptaTerminos,
    }));
  };

  const handleGoToPayment = () => {
    if (!identificacionCompletada || !stepTwoValid) return;

    setOrden((prev) => ({
      ...prev,
      subtotal,
      costoEnvio: effectiveShipping,
      total,
      metodoEnvioId: deliveryMode === "delivery" ? 1 : 2,
      direccionResumen: deliveryAddress,
      destinatario: recipient,
      fechaEntrega: deliveryDate,
      franjaEntrega: deliveryWindow,
    }));

    setShowPaymentModal(true);
  };

  const handleSimulatedPayment = (result: {
    method: PaymentMethodId;
    last4?: string;
  }) => {
    setShowPaymentModal(false);
    setOrden((prev) => ({
      ...prev,
      metodoPagoId: METHOD_ID_MAP[result.method],
      metodoPagoNombre: METHOD_LABEL_MAP[result.method],
      subtotal,
      costoEnvio: effectiveShipping,
      total,
      estadoOrdenId: 2,
    }));

    router.push("/venta/resumen");
  };

  if (!cart.length) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-lg text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Tu carrito está vacío
          </h1>
          <p className="text-sm text-gray-600">
            Agrega productos al carrito para continuar con el proceso de compra.
          </p>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Ir al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white">
                1
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                  Identificación
                </p>
                <h2 className="text-lg font-bold text-gray-900">
                  Confirma tus datos personales
                </h2>
              </div>
            </div>
            {identificacionCompletada && (
              <button
                onClick={() => setIdentificacionCompletada(false)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Editar
              </button>
            )}
          </div>

          {!identificacionCompletada ? (
            <form
              onSubmit={handleIdentificationSubmit}
              className="mt-6 space-y-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-gray-600">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={identificacion.email}
                    onChange={(event) =>
                      setIdentificacion((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    required
                    className="mt-1 w-full rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600">
                    Nombre
                  </label>
                  <input
                    value={identificacion.nombre}
                    onChange={(event) =>
                      setIdentificacion((prev) => ({
                        ...prev,
                        nombre: event.target.value,
                      }))
                    }
                    required
                    className="mt-1 w-full rounded-lg bg-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600">
                    Apellido
                  </label>
                  <input
                    value={identificacion.apellido}
                    onChange={(event) =>
                      setIdentificacion((prev) => ({
                        ...prev,
                        apellido: event.target.value,
                      }))
                    }
                    required
                    className="mt-1 w-full rounded-lg bg-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600">
                    Tipo de documento
                  </label>
                  <select
                    value={identificacion.tipoDocumento}
                    onChange={(event) =>
                      setIdentificacion((prev) => ({
                        ...prev,
                        tipoDocumento: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg bg-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">Carné de extranjería</option>
                    <option value="PAS">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600">
                    Documento
                  </label>
                  <input
                    value={identificacion.numeroDocumento}
                    onChange={(event) =>
                      setIdentificacion((prev) => ({
                        ...prev,
                        numeroDocumento: event.target.value,
                      }))
                    }
                    required
                    className="mt-1 w-full rounded-lg bg-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600">
                    Teléfono / Móvil
                  </label>
                  <input
                    value={identificacion.telefono}
                    onChange={(event) =>
                      setIdentificacion((prev) => ({
                        ...prev,
                        telefono: event.target.value,
                      }))
                    }
                    required
                    className="mt-1 w-full rounded-lg bg-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={identificacion.aceptaTerminos}
                  onChange={(event) =>
                    setIdentificacion((prev) => ({
                      ...prev,
                      aceptaTerminos: event.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span>
                  He leído y acepto los{" "}
                  <span className="text-red-600 font-semibold">
                    Términos y Condiciones
                  </span>{" "}
                  y{" "}
                  <span className="text-red-600 font-semibold">
                    Políticas de privacidad
                  </span>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={!identificationValid}
                className={clsx(
                  "rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition",
                  identificationValid ? "hover:bg-red-700" : "opacity-60"
                )}
              >
                Ir para la entrega
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <User className="h-4 w-4" />
                <span>
                  {identificacion.nombre} {identificacion.apellido}
                </span>
              </div>
              <p className="mt-2">{identificacion.email}</p>
              <p className="mt-1">{identificacion.telefono}</p>
              <p className="mt-1">
                {identificacion.tipoDocumento}: {identificacion.numeroDocumento}
              </p>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white">
                2
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                  Entrega
                </p>
                <h2 className="text-lg font-bold text-gray-900">
                  Revisa tu dirección y horario
                </h2>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    id: "delivery",
                    label: "Envío a domicilio",
                    helper: "Recibe tu pedido en donde estés",
                    icon: Truck,
                  },
                  {
                    id: "pickup",
                    label: "Recojo en tienda",
                    helper: "Sin costo adicional",
                    icon: MapPin,
                  },
                ] as const
              ).map((option) => {
                const isActive = deliveryMode === option.id;
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDeliveryMode(option.id)}
                    className={clsx(
                      "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
                      isActive
                        ? "border-red-500 bg-red-50 shadow-sm"
                        : "border-gray-200 hover:border-red-300"
                    )}
                  >
                    <span
                      className={clsx(
                        "mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center",
                        isActive ? "border-red-600" : "border-gray-300"
                      )}
                    >
                      {isActive && (
                        <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                      )}
                    </span>
                    <Icon
                      className={clsx(
                        "h-5 w-5 mt-0.5",
                        isActive ? "text-red-600" : "text-gray-400"
                      )}
                    />
                    <span>
                      <span className="block text-sm font-semibold text-gray-900">
                        {option.label}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {option.helper}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                <span>Dirección de entrega</span>
                <button
                  onClick={() => setEditingAddress((prev) => !prev)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {editingAddress ? "Guardar" : "Cambiar"}
                </button>
              </div>
              {editingAddress ? (
                <div className="mt-3 space-y-3">
                  <input
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                    placeholder="Ingresa la dirección de entrega"
                  />
                  {deliveryMode === "delivery" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-xs font-semibold uppercase text-gray-600">
                        Fecha estimada
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={(event) =>
                            setDeliveryDate(event.target.value)
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                        />
                      </label>
                      <label className="text-xs font-semibold uppercase text-gray-600">
                        Franja horaria
                        <select
                          value={deliveryWindow}
                          onChange={(event) =>
                            setDeliveryWindow(event.target.value)
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                        >
                          <option value="08:00 - 21:00">
                            8:00 am - 9:00 pm
                          </option>
                          <option value="09:00 - 18:00">
                            9:00 am - 6:00 pm
                          </option>
                          <option value="18:00 - 21:00">
                            6:00 pm - 9:00 pm
                          </option>
                        </select>
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">
                    {deliveryAddress}
                  </p>
                  {deliveryMode === "delivery" && (
                    <p className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDeliveryDateLabel(deliveryDate)}, entrega entre{" "}
                      {deliveryWindow}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-2xl border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-900">Productos</p>
              <div className="flex flex-wrap items-center gap-3">
                {cart.slice(0, 3).map((item) => (
                  <div
                    key={item.productId}
                    className="flex h-16 w-16 items-center justify-center rounded-xl border border-gray-200 bg-white"
                  >
                    <img
                      src={item.image_producto}
                      alt={item.nombre}
                      className="h-full w-full rounded-xl object-cover p-1"
                    />
                  </div>
                ))}
                {cart.length > 3 && (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm font-semibold text-gray-500">
                    +{cart.length - 3}
                  </div>
                )}
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Resumen</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>{formatPrice(effectiveShipping)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                <span>¿Quién recibirá el pedido?</span>
                <button
                  onClick={() => setEditingRecipient((prev) => !prev)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {editingRecipient ? "Guardar" : "Cambiar"}
                </button>
              </div>
              {editingRecipient ? (
                <input
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                  placeholder="Nombre de la persona que recibirá"
                />
              ) : (
                <p className="mt-2 text-sm text-gray-700">{recipient}</p>
              )}
            </div>

            <button
              onClick={handleGoToPayment}
              disabled={!identificacionCompletada || !stepTwoValid}
              className={clsx(
                "w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white shadow-lg transition",
                identificacionCompletada && stepTwoValid
                  ? "hover:bg-red-700 hover:shadow-xl"
                  : "opacity-60"
              )}
            >
              Ir para el pago
            </button>
          </div>
        </section>
      </div>

      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        subtotal={subtotal}
        shipping={effectiveShipping}
        total={total}
        customerName={`${identificacion.nombre} ${identificacion.apellido}`.trim()}
        onSimulate={handleSimulatedPayment}
      />
    </div>
  );
}
