"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/app/context/CheckoutContext";
import { useCart } from "@/app/context/CartContext";
import { formatPrice } from "@/app/utils/formatPrice";
import {
  MapPin,
  Truck,
  Store,
  Plus,
} from "lucide-react";
import clsx from "clsx";
import FormularioDireccion from "@/app/components/ui/FormularioDireccion";
import Link from "next/link";

interface Direccion {
  id?: number;
  piso: string | null;
  lote: string | null;
  calle: string | null;
  distrito: string | null;
  provincia: string | null;
  departamento: string | null;
  codigo_postal: string | null;
  isPrimary: boolean;
}

// Simulated delivery dates
const getDeliveryDates = () => {
  const today = new Date();
  const dates = [];
  for (let i = 2; i <= 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      id: i,
      date: date.toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: "Entrega entre 8 am a 9 pm",
      price: i === 2 ? 15 : 10,
    });
  }
  return dates;
};

export default function EntregaPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { orden, setOrden } = useCheckout();
  const { cart } = useCart();

  // Delivery method
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(
    "delivery"
  );

  // Addresses
  const [directions, setDirections] = useState<Direccion[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDirection, setEditDirection] = useState<Direccion | null>(null);

  // Delivery date
  const deliveryDates = useMemo(() => getDeliveryDates(), []);
  const [selectedDate, setSelectedDate] = useState<number>(
    deliveryDates[0]?.id || 0
  );

  // Recipient
  const [destinatario, setDestinatario] = useState(
    orden.nombre && orden.apellido ? `${orden.nombre} ${orden.apellido}` : ""
  );

  // Shipping cost
  const shippingCost = 10;

  // Calculate totals
  const subtotal = cart.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );
  const selectedDelivery = deliveryDates.find((d) => d.id === selectedDate);
  const envio =
    deliveryMethod === "pickup" ? 0 : selectedDelivery?.price || shippingCost;
  const total = subtotal + envio;

  // Fetch addresses
  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    const fetchDirections = async () => {
      try {
        const res = await fetch(
          `/api/direccion?usuario_id=${session.user!.id}`
        );
        if (!res.ok) throw new Error("Error al obtener las direcciones");
        const data: Direccion[] = await res.json();
        setDirections(data);
        const primary = data.find((d) => d.isPrimary) ?? data[0];
        setSelectedAddress(primary?.id ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDirections();
  }, [session]);

  // Update destinatario when orden changes
  useEffect(() => {
    if (orden.nombre && orden.apellido && !destinatario) {
      setDestinatario(`${orden.nombre} ${orden.apellido}`);
    }
  }, [orden.nombre, orden.apellido]);

  const formatAddress = (d: Direccion) => {
    const parts = [
      d.calle,
      d.lote && `Lote ${d.lote}`,
      d.piso && `Piso ${d.piso}`,
      d.distrito,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const openNewAddress = () => {
    setEditDirection({
      piso: "",
      lote: "",
      calle: "",
      distrito: "",
      provincia: "",
      departamento: "",
      codigo_postal: "",
      isPrimary: false,
    });
    setIsModalOpen(true);
  };

  const handleContinue = () => {
    const selectedAddr = directions.find((d) => d.id === selectedAddress);

    setOrden({
      ...orden,
      direccionEnvioId: selectedAddress,
      metodoEnvioId: deliveryMethod === "delivery" ? 1 : 2,
      costoEnvio: envio,
      total,
      direccionResumen: selectedAddr ? formatAddress(selectedAddr) : "",
      destinatario,
      fechaEntrega: selectedDelivery?.date || "",
      franjaEntrega: selectedDelivery?.time || "",
    });

    router.push("/venta/pago");
  };

  const canContinue =
    deliveryMethod === "pickup" || (selectedAddress && destinatario);

  // Redirect if no identification
  if (!orden.email || !orden.nombre) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Primero completa tu identificación
          </h2>
          <Link
            href="/venta/identificacion"
            className="text-sky-600 hover:underline"
          >
            Ir a identificación
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen bg-white py-6 sm:py-8"
      aria-label="Paso 2: Método de entrega"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Delivery Method Tabs */}
        <div
          className="flex mb-6 border-b border-gray-200"
          role="tablist"
          aria-label="Métodos de entrega"
        >
          <button
            role="tab"
            aria-selected={deliveryMethod === "delivery"}
            aria-controls="delivery-panel"
            onClick={() => setDeliveryMethod("delivery")}
            className={clsx(
              "flex-1 py-3 px-4 text-center font-medium transition-all border-b-2 -mb-[2px]",
              deliveryMethod === "delivery"
                ? "border-sky-500 text-sky-600 bg-sky-50"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <Truck className="w-5 h-5 inline-block mr-2" aria-hidden="true" />
            Envío a domicilio
          </button>
          <button
            role="tab"
            aria-selected={deliveryMethod === "pickup"}
            aria-controls="pickup-panel"
            onClick={() => setDeliveryMethod("pickup")}
            className={clsx(
              "flex-1 py-3 px-4 text-center font-medium transition-all border-b-2 -mb-[2px]",
              deliveryMethod === "pickup"
                ? "border-sky-500 text-sky-600 bg-sky-50"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <Store className="w-5 h-5 inline-block mr-2" aria-hidden="true" />
            Recojo en tienda
          </button>
        </div>

        {/* Step Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm"
            aria-hidden="true"
          >
            2
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Entrega
          </h1>
        </div>

        {deliveryMethod === "delivery" && (
          <div
            id="delivery-panel"
            role="tabpanel"
            aria-label="Opciones de envío a domicilio"
            className="space-y-6"
          >
            {/* Address Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Direccion de entrega
              </h3>

              {directions.length > 0 ? (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin
                      className="w-5 h-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <select
                      value={selectedAddress || ""}
                      onChange={(e) =>
                        setSelectedAddress(Number(e.target.value))
                      }
                      className="bg-transparent border-none focus:ring-0 text-gray-900 font-medium pr-8"
                      aria-label="Seleccionar dirección de entrega"
                    >
                      {directions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {formatAddress(d)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={openNewAddress}
                    className="text-sky-600 hover:underline text-sm font-medium"
                    aria-label="Agregar o cambiar dirección de entrega"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <button
                  onClick={openNewAddress}
                  className="w-full bg-gray-50 rounded-xl p-4 flex items-center justify-center gap-2 text-sky-600 hover:bg-gray-100 transition-colors"
                  aria-label="Agregar nueva dirección de entrega"
                >
                  <Plus className="w-5 h-5" aria-hidden="true" />
                  <span className="font-medium">Agregar dirección</span>
                </button>
              )}
            </div>

            {/* Products Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                • Entrega productos de{" "}
                <span className="font-semibold">[Tienda ecloudi]</span>
              </h3>

              <div className="mb-4">
                <span className="text-sm text-gray-600">Productos</span>
                <div
                  className="flex gap-2 mt-2 flex-wrap"
                  role="list"
                  aria-label="Productos en tu pedido"
                >
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
                      role="listitem"
                    >
                      <img
                        src={item.image_producto}
                        alt={`${item.nombre} - cantidad: ${item.cantidad}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Date Selection */}
              <fieldset className="space-y-2">
                <legend className="sr-only">
                  Seleccionar fecha de entrega
                </legend>
                {deliveryDates.slice(0, 2).map((delivery) => (
                  <button
                    key={delivery.id}
                    onClick={() => setSelectedDate(delivery.id)}
                    aria-pressed={selectedDate === delivery.id}
                    aria-label={`Entrega el ${delivery.date}, ${
                      delivery.time
                    }, costo: ${formatPrice(delivery.price)}`}
                    className={clsx(
                      "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                      selectedDate === delivery.id
                        ? "border-sky-500 bg-sky-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={clsx(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                          selectedDate === delivery.id
                            ? "border-sky-500 bg-sky-500"
                            : "border-gray-300"
                        )}
                        aria-hidden="true"
                      >
                        {selectedDate === delivery.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 capitalize">
                          {delivery.date}
                        </p>
                        <p className="text-sm text-gray-500">{delivery.time}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(delivery.price)}
                    </span>
                  </button>
                ))}
              </fieldset>
            </div>

            {/* Recipient Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3
                className="text-sm font-medium text-gray-700 mb-3"
                id="recipient-label"
              >
                Quien recibira el pedido ?
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                <input
                  type="text"
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-gray-900 font-medium flex-1"
                  placeholder="Nombre del destinatario"
                  aria-labelledby="recipient-label"
                  aria-label="Nombre de la persona que recibirá el pedido"
                  autoComplete="name"
                />
                <button
                  className="text-sky-600 hover:underline text-sm font-medium"
                  aria-label="Cambiar destinatario"
                >
                  Cambiar
                </button>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              aria-label={
                canContinue
                  ? "Continuar al paso de pago"
                  : "Complete la información de entrega para continuar"
              }
              aria-disabled={!canContinue}
              className={clsx(
                "w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-white transition-all",
                canContinue
                  ? "bg-sky-500 hover:bg-sky-600 shadow-lg"
                  : "bg-gray-300 cursor-not-allowed"
              )}
            >
              Ir para el pago
            </button>
          </div>
        )}

        {deliveryMethod === "pickup" && (
          <div
            id="pickup-panel"
            role="tabpanel"
            aria-label="Información de recojo en tienda"
            className="space-y-6"
          >
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <Store
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
                aria-hidden="true"
              />
              <h3 className="font-semibold text-gray-900 mb-1">
                ecloudi San Isidro
              </h3>
              <p className="text-sm text-gray-600">
                Av. Conquistadores 456, San Isidro
              </p>
              <p className="text-xs text-gray-500 mt-1">L-S 9:00 - 20:00</p>
            </div>

            <button
              onClick={handleContinue}
              aria-label="Continuar al paso de pago con recojo en tienda"
              className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-white bg-sky-500 hover:bg-sky-600 shadow-lg transition-all"
            >
              Ir para el pago
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mt-8 space-y-4">
          {/* Identification Summary */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
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
            <div className="text-sm text-gray-600 space-y-0.5 pl-8">
              <p>{orden.email}</p>
              <p>
                {orden.nombre} {orden.apellido}
              </p>
              <p>{orden.telefono}</p>
              <p>{orden.numeroDocumento}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {isModalOpen && (
        <FormularioDireccion
          direccion={editDirection}
          onClose={() => {
            setIsModalOpen(false);
            // Refresh addresses
            if (session?.user?.id) {
              fetch(`/api/direccion?usuario_id=${session.user.id}`)
                .then((res) => res.json())
                .then((data) => {
                  setDirections(data);
                  if (data.length > 0 && !selectedAddress) {
                    setSelectedAddress(data[0].id);
                  }
                });
            }
          }}
        />
      )}
    </main>
  );
}
