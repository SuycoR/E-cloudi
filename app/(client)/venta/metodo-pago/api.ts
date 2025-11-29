import { MercadoPagoConfig, Preference } from "mercadopago";

export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

// Tipos para los datos que recibirá el submit
interface CartItem {
  productId: number;
  nombre: string;
  cantidad: number;
  precio: number;
  precioOriginal?: number;
  descuento?: number;
  id_producto_especifico?: number;
}

interface CartResumenItem {
  id_producto_especifico?: number;
  productId?: number;
  precioOriginal?: number;
  descuento?: number;
  cantidad: number;
}

interface CheckoutMetadata {
  usuario_id?: string | null;
  usuarioId?: string | null;
  direccion_envio_id?: number | null;
  direccionEnvioId?: number | null;
  metodo_envio_id?: number | null;
  metodoEnvioId?: number | null;
  subtotal: number;
  costo_envio?: number;
  costoEnvio?: number;
  total: number;
  cartResumen?: CartResumenItem[];
  cart_resumen?: CartResumenItem[];
}

const api = {
  message: {
    async submit({
      cart,
      metadata,
    }: {
      cart: CartItem[];
      metadata: CheckoutMetadata;
    }) {
      // Construir los items para MercadoPago
      const items = cart.map((item) => ({
        id: String(item.productId),
        title: item.nombre,
        quantity: Number(item.cantidad),
        unit_price: Number(item.precio),
      }));
      
      // Usar cart como base y extraer los datos necesarios
      const cart_resumen = cart.map((item) => ({
        id_producto_especifico: item.id_producto_especifico ?? item.productId,
        nombre: item.nombre,
        precioOriginal: item.precioOriginal ?? Number(item.precio) ?? 0,
        descuento: Number(item.descuento ?? 0),
        cantidad: Number(item.cantidad),
      }));

      // Normalizar metadata a snake_case para MercadoPago
      const normalizedMetadata = {
        usuario_id: metadata.usuario_id ?? metadata.usuarioId ?? null,
        direccion_envio_id: metadata.direccion_envio_id ?? metadata.direccionEnvioId ?? null,
        metodo_envio_id: metadata.metodo_envio_id ?? metadata.metodoEnvioId ?? null,
        subtotal: metadata.subtotal,
        costo_envio: metadata.costo_envio ?? metadata.costoEnvio ?? 0,
        total: metadata.total,
        cart_resumen,
      };

      // Crear la preferencia con solo los métodos de pago permitidos
      const preference = await new Preference(mercadopago).create({
        body: {
          items,
          metadata: normalizedMetadata,
          back_urls: {
            success: `${
              process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
            }/venta/resumen`,
            failure: `${
              process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
            }/venta/resumen`,
            pending: `${
              process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
            }/venta/resumen`,
          },
          auto_return: "approved",
          payment_methods: {
            // Solo permitir: credit_card, debit_card, bank_transfer, digital_wallet
            excluded_payment_types: [
              { id: "ticket" },         // PagoEfectivo, pagos en efectivo
              { id: "prepaid_card" },   // Tarjetas prepago
              { id: "paypal" },         // PayPal
            ],
            installments: 1,
            default_installments: 1,
          },
        },
      });

      return preference.init_point!;
    },
  },
};

export default api;