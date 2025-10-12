"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Truck,
  Store,
  Plus,
  Edit2,
  Trash2,
  Check,
} from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { deleteDireccionHandler } from "@/app/utils/deleteDireccionHandler";
import FormularioDireccion from "@/app/components/ui/FormularioDireccion";
import { useCheckout } from "@/app/context/CheckoutContext";
import { useCart } from "@/app/context/CartContext";
import { crearPreferenciaMP } from "../metodo-pago/mercado-pago/actions";

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

const STORES = [
  {
    id: 1,
    name: "CompX San Isidro",
    address: "Av. Conquistadores 456, San Isidro",
    hours: "L-S 9-20 h",
    available: true,
  },
];

export default function DireccionesPage() {
  const { data: session } = useSession();
  const { cart } = useCart();
  const { orden, setOrden } = useCheckout();

  // MÉTODOS DE ENTREGA
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(
    "delivery"
  );
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [selectedStore, setSelectedStore] = useState<number>(1);

  // DIRECCIONES
  const [directions, setDirections] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // COSTO DE ENVÍO
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // MODAL DE DIRECCIÓN
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDirection, setEditDirection] = useState<Direccion | null>(null);

  // CALCULAR SUBTOTAL Y TOTAL
  const subtotal = useMemo(
    () =>
      cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [cart]
  );

  const total =
    deliveryMethod === "pickup"
      ? subtotal
      : shippingCost !== null
      ? subtotal + shippingCost
      : null;

  // Actualizar orden en el contexto cuando cambian método o selección
  useEffect(() => {
    if (deliveryMethod === "delivery" && selectedAddress) {
      setOrden({
        ...orden,
        direccionEnvioId: selectedAddress,
        metodoEnvioId: 1,
      });
    } else if (deliveryMethod === "pickup") {
      setOrden({
        ...orden,
        direccionEnvioId: null,
        metodoEnvioId: 2,
      });
    }
  }, [deliveryMethod, selectedAddress, selectedStore, orden, setOrden]);

  // Consultar costo de envío dinámicamente
  useEffect(() => {
    if (deliveryMethod !== "delivery" || !selectedAddress) {
      setShippingCost(0);
      setShippingError(null);
      setShippingLoading(false);
      return;
    }
    setShippingLoading(true);
    setShippingError(null);

    fetch(`/api/envio?direccionId=${selectedAddress}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudo calcular el costo de envío");
        const data = await res.json();
        let costo = data.costoEnvio;
        if (typeof costo === "string") {
          const parsed = parseFloat(costo);
          costo = isNaN(parsed) ? null : parsed;
        }
        setShippingCost(typeof costo === "number" && !isNaN(costo) ? costo : null);
      })
      .catch(() => {
        setShippingError("Error al calcular el costo de envío");
        setShippingCost(null);
      })
      .finally(() => setShippingLoading(false));
  }, [deliveryMethod, selectedAddress]);

  // Obtener direcciones del usuario
  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchDirections = async () => {
      try {
        const res = await fetch(`/api/direccion?usuario_id=${session.user!.id}`);
        if (!res.ok) throw new Error("Error al obtener las direcciones");
        const data: Direccion[] = await res.json();
        setDirections(data);
        const primary = data.find((d) => d.isPrimary) ?? data[0];
        setSelectedAddress(primary?.id ?? null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchDirections();
  }, [session]);

  const formatAddress = (d: Direccion) => {
    const line1 = [d.piso && `Piso ${d.piso}`, d.lote && `Lote ${d.lote}`, d.calle]
      .filter(Boolean)
      .join(" ");
    const line2 = [d.distrito, d.provincia, d.departamento].filter(Boolean).join(", ");
    return `${line1}${line1 && line2 ? ", " : ""}${line2}`;
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

  const openEditAddress = (d: Direccion) => {
    setEditDirection(d);
    setIsModalOpen(true);
  };

  const handleDelete = async (d: Direccion) => {
    if (!d.id || !session?.user?.id) return;
    if (!confirm("¿Eliminar dirección?")) return;
    const res = await deleteDireccionHandler(d.id, Number(session.user!.id));
    if (res.ok) {
      setDirections((prev) => prev.filter((x) => x.id !== d.id));
      if (selectedAddress === d.id) setSelectedAddress(null);
    } else {
      alert(res.mensaje);
    }
  };

  const handleContinue = async () => {
    // Actualizar contexto con subtotal y total reales
    setOrden({
      ...orden,
      subtotal,
      costoEnvio: shippingCost ?? 0,
      total: total ?? subtotal,
    });

    // Crear preferencia en MercadoPago
    await crearPreferenciaMP({
      cart: cart.map(
        ({
          productId,
          nombre,
          cantidad,
          precio,
          precioOriginal,
          descuento,
        }) => ({
          productId,
          nombre,
          cantidad,
          precio,
          precioOriginal,
          descuento,
          id_producto_especifico: productId,
        })
      ),
      metadata: {
        usuarioId: orden.usuarioId,
        direccionEnvioId: orden.direccionEnvioId,
        metodoEnvioId: orden.metodoEnvioId,
        subtotal,
        costoEnvio: shippingCost ?? 0,
        total: total ?? subtotal,
      },
    });
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ebony-50 to-ebony-100/30">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ebony-700" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ebony-50 to-ebony-100/30">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center space-y-4">
          <p className="text-ebony-700">{error}</p>
          <button
            onClick={() => location.reload()}
            className="px-4 py-2 rounded-lg bg-ebony-700 text-white hover:bg-ebony-800"
          >
            Reintentar
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-ebony-50 to-ebony-100/30 py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-1.5 bg-gradient-to-r from-ebony-900 to-ebony-900 rounded-lg">
              <MapPin className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-ebony-900">
              Dirección de entrega
            </h1>
          </div>
          <p className="text-sm sm:text-base text-ebony-600 font-medium">
            Paso 2 de 4 — Selecciona dónde recibirás tu pedido
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <section className="flex-1 lg:max-w-3xl space-y-6">
            {/* Método de entrega */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-ebony-200/50">
              <h2 className="text-lg sm:text-xl font-semibold text-ebony-900 mb-4">
                Método de entrega
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    id: "delivery",
                    label: "Envío a domicilio",
                    icon: Truck,
                    helper: "Recíbelo en la puerta de tu casa",
                  },
                  {
                    id: "pickup",
                    label: "Recojo en tienda",
                    icon: Store,
                    helper: "Sin costo de envío",
                  },
                ].map(({ id, label, icon: Icon, helper }) => (
                  <button
                    key={id}
                    onClick={() =>
                      setDeliveryMethod(id as "delivery" | "pickup")
                    }
                    className={clsx(
                      "p-4 rounded-xl ring-1 flex gap-3 text-left transition-all",
                      deliveryMethod === id
                        ? "ring-ebony-700 bg-ebony-50"
                        : "ring-ebony-200 hover:ring-ebony-300"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-5 h-5 flex-none",
                        deliveryMethod === id
                          ? "text-ebony-700"
                          : "text-ebony-400"
                      )}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-semibold text-ebony-900">{label}</p>
                      <p className="text-sm text-ebony-600">{helper}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Direcciones guardadas */}
            {deliveryMethod === "delivery" && (
              <div className="bg-white rounded-xl p-6 shadow-md border border-ebony-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-ebony-900">
                    Direcciones guardadas
                  </h3>
                  <button
                    onClick={openNewAddress}
                    className="flex items-center gap-2 text-ebony-700 hover:text-ebony-900 font-medium"
                  >
                    <Plus className="w-4 h-4" /> Nueva dirección
                  </button>
                </div>
                {directions.length > 0 ? (
                  <div role="list" className="space-y-3">
                    {directions.map((d) => (
                      <div
                        key={d.id}
                        role="listitem"
                        onClick={() => setSelectedAddress(d.id ?? null)}
                        className={clsx(
                          "p-4 rounded-xl shadow-sm ring-1 cursor-pointer transition-all",
                          selectedAddress === d.id
                            ? "ring-ebony-700 bg-ebony-50"
                            : "ring-ebony-200 hover:ring-ebony-300"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={clsx(
                              "w-5 h-5 rounded-full ring-2 flex items-center justify-center mt-0.5",
                              selectedAddress === d.id
                                ? "ring-ebony-700 bg-ebony-700"
                                : "ring-ebony-300"
                            )}
                            aria-checked={selectedAddress === d.id}
                            role="radio"
                          >
                            {selectedAddress === d.id && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-ebony-900 mb-0.5 truncate">
                              {formatAddress(d)}
                            </p>
                            {d.codigo_postal && (
                              <p className="text-xs text-ebony-600">
                                CP {d.codigo_postal}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditAddress(d);
                              }}
                              className="p-1 text-ebony-400 hover:text-ebony-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(d);
                              }}
                              className="p-1 text-ebony-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <MapPin className="w-10 h-10 text-ebony-300 mx-auto mb-3" />
                    <p className="text-ebony-600 mb-4">
                      Aún no tienes direcciones guardadas
                    </p>
                    <button
                      onClick={openNewAddress}
                      className="px-4 py-2 rounded-lg bg-ebony-700 text-white hover:bg-ebony-800"
                    >
                      Agregar primera dirección
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tiendas */}
            {deliveryMethod === "pickup" && (
              <div className="bg-white rounded-xl p-6 shadow-md border border-ebony-200/50">
                <h3 className="text-lg font-semibold text-ebony-900 mb-4">
                  Selecciona una tienda
                </h3>
                <div role="list" className="space-y-3">
                  {STORES.map((s) => (
                    <div
                      key={s.id}
                      role="listitem"
                      onClick={() => s.available && setSelectedStore(s.id)}
                      className={clsx(
                        "p-4 rounded-xl shadow-sm ring-1 transition-all",
                        !s.available
                          ? "ring-ebony-200 bg-ebony-50 cursor-not-allowed"
                          : selectedStore === s.id
                          ? "ring-ebony-700 bg-ebony-50 cursor-pointer"
                          : "ring-ebony-200 hover:ring-ebony-300 cursor-pointer"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={clsx(
                            "w-5 h-5 rounded-full ring-2 flex items-center justify-center mt-0.5",
                            s.available && selectedStore === s.id
                              ? "ring-ebony-700 bg-ebony-700"
                              : "ring-ebony-300"
                          )}
                          aria-checked={selectedStore === s.id}
                          role="radio"
                        >
                          {s.available && selectedStore === s.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p
                              className={clsx(
                                "font-medium",
                                s.available
                                  ? "text-ebony-900"
                                  : "text-ebony-500"
                              )}
                            >
                              {s.name}
                            </p>
                            {!s.available && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                No disponible
                              </span>
                            )}
                          </div>
                          <p
                            className={clsx(
                              "text-sm",
                              s.available ? "text-ebony-600" : "text-ebony-500"
                            )}
                          >
                            {s.address}
                          </p>
                          <p className="text-xs text-ebony-500">{s.hours}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Resumen */}
          <aside className="lg:w-80 lg:flex-shrink-0">
            <div className="sticky top-6 bg-white rounded-xl p-6 shadow-lg border border-ebony-200/50">
              <h3 className="text-lg font-semibold text-ebony-900 mb-4">
                Resumen
              </h3>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-ebony-600">
                  <span>Subtotal</span>
                  <span>S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-ebony-600">
                  <span>Envío</span>
                  <span>
                    {deliveryMethod === "pickup"
                      ? "Gratis"
                      : shippingLoading
                      ? <span className="text-ebony-400">Calculando…</span>
                      : shippingError
                      ? <span className="text-red-600">Error</span>
                      : shippingCost !== null
                      ? `S/ ${shippingCost.toFixed(2)}`
                      : "--"}
                  </span>
                </div>
                <hr className="border-ebony-200" />
                <div className="flex justify-between font-semibold text-ebony-900">
                  <span>Total</span>
                  <span>
                    {total !== null ? `S/ ${total.toFixed(2)}` : "--"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleContinue}
                disabled={deliveryMethod === "delivery" && !selectedAddress}
                className={clsx(
                  "w-full py-3 rounded-lg font-medium shadow-lg transition-all",
                  deliveryMethod === "delivery" && !selectedAddress
                    ? "bg-ebony-200 text-ebony-500 cursor-not-allowed"
                    : "bg-ebony-700 text-white hover:bg-ebony-800"
                )}
              >
                Continuar
              </button>
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-ebony-500">
                <div className="w-2 h-2 bg-ebony-700 rounded-full" /> Pago
                seguro y protegido
              </div>
            </div>
          </aside>
        </div>
      </div>

      {isModalOpen && (
        <FormularioDireccion
          direccion={editDirection}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
