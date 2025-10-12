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

interface CheckoutMetadata {
  usuario_id: string | null;
  direccion_envio_id: number | null;
  metodo_envio_id: number | null;
  subtotal: number;
  costo_envio: number;
  total: number;
  cart_resumen: Array<{
    id_producto_especifico: number;
    precioOriginal: number;
    descuento: number;
    cantidad: number;
  }>;
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
      
      const cart_resumen_base = Array.isArray(metadata.cartResumen)
        ? metadata.cartResumen
        : Array.isArray(metadata.cart_resumen)
        ? metadata.cart_resumen
        : cart;

      const cart_resumen = cart_resumen_base.map((item, idx) => ({
        
        id_producto_especifico: item.id_producto_especifico ?? item.productId,
        nombre: item.nombre ?? cart[idx]?.nombre, // Siempre intenta incluir el nombre
        precioOriginal: item.precioOriginal ?? item.precio_original ?? Number(item.precio) ?? 0,
        descuento: Number(item.descuento ?? 0),
        cantidad: Number(item.cantidad),
      }));



      // Crear la preferencia con solo los métodos de pago permitidos
      const preference = await new Preference(mercadopago).create({
        body: {
          items,
          metadata: {
            ...metadata,
            cart_resumen,
          },
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