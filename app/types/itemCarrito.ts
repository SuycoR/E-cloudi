export interface CartItem {
  productId: number; //Uso el id de Producto especifico
  nombre: string;
  descripcion: string;
  image_producto: string;
  cantidad: number;
  precio: number;
  precioOriginal?: number;
  descuento?: number;
}
