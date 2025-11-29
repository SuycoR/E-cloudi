"use client";
import React, { useState } from "react";
import type { ProductDetailProps } from "@/app/types/props";
import { Expand, X } from "lucide-react";
import ProductVariations, { ProductVariationItem } from "./ProductVariations";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import type { CartItem } from "@/app/types/itemCarrito";
// Importando para google analytics
import { sendGAEvent } from "@next/third-parties/google";

function Breadcrumb({
  nivel_1,
  nivel_2,
  nivel_3,
  nombre,
  isFullScreen,
  id_cat_n1,
  id_cat_n2,
  id_cat_n3,
}: any) {
  if (isFullScreen) return null;
  return (
    <nav
      className="absolute z-1 pt-22 text-sm text-gray-600 hidden lg:block"
      aria-label="Breadcrumb"
    >
      <ol
        className="list-reset flex"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            href="/"
            itemProp="item"
            className="hover:text-gray-800 transition-colors"
          >
            <span itemProp="name">Inicio</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>
        {nivel_1 && (
          <>
            <li className="mx-2 text-gray-400">{">"}</li>
            <li
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <Link
                href={`/categoria/${1}/${id_cat_n1}`}
                itemProp="item"
                className="hover:text-gray-800 transition-colors"
              >
                <span itemProp="name">{nivel_1}</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
          </>
        )}
        {nivel_2 && (
          <>
            <li className="mx-2 text-gray-400">{">"}</li>
            <li
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <Link
                href={`/categoria/${2}/${id_cat_n2}`}
                itemProp="item"
                className="hover:text-gray-800 transition-colors"
              >
                <span itemProp="name">
                  {nivel_2.length > 12 ? nivel_2.slice(0, 7) + "..." : nivel_2}
                </span>
              </Link>
              <meta itemProp="position" content="3" />
            </li>
          </>
        )}
        {nivel_3 && (
          <>
            <li className="mx-2 text-gray-400">{">"}</li>
            <li
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <Link
                href={`/categoria/${3}/${id_cat_n3}`}
                itemProp="item"
                className="hover:text-gray-800 transition-colors"
              >
                <span itemProp="name">
                  {nivel_3.length > 12 ? nivel_3.slice(0, 7) + "..." : nivel_3}{" "}
                </span>
              </Link>
              <meta itemProp="position" content="4" />
            </li>
          </>
        )}
        <li className="mx-2 text-gray-400">{">"}</li>
        <li
          className="font-semibold text-gray-800"
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <span itemProp="name">
            {nombre.length > 12 ? nombre.slice(0, 7) + "..." : nombre}
          </span>
          <meta itemProp="position" content="5" />
        </li>
      </ol>
    </nav>
  );
}

function ProductImage({
  imagen_producto,
  nombre,
  descuento,
  openFullScreen,
  isFullScreen,
}: any) {
  return (
    <section
      className="flex-1/2 flex flex-col items-center justify-center relative m-auto max-w-full xl:max-w-2/5"
      aria-label="Imagen del producto"
    >
      <div className="relative flex w-full m-auto">
        <div className="aspect-square w-full max-w-[320px] sm:max-w-[340px] md:max-w-[360px] lg:max-w-[380px] xl:max-w-[400px] m-auto bg-gradient-to-br from-gray-50 to-white flex items-center justify-center rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative group">
          {!isFullScreen && descuento && (
            <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg tracking-wide animate-pulse pointer-events-none select-none">
              {Math.round(descuento * 100)}% OFF
            </div>
          )}
          <img
            src={
              !imagen_producto || imagen_producto === "null"
                ? "https://img.freepik.com/vector-gratis/ilustracion-icono-doodle-engranaje_53876-5596.jpg?semt=ais_hybrid&w=740"
                : imagen_producto
            }
            alt={`Imagen de ${nombre}`}
            className="w-full h-full object-contain rounded-2xl max-h-[340px] sm:max-h-[360px] md:max-h-[380px] lg:max-h-[400px] xl:max-h-[420px] transition-transform duration-300 ease-in-out group-hover:scale-105"
            itemProp="image"
          />
        </div>
        {!isFullScreen && (
          <button
            className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 z-20 border border-gray-200 group"
            title="Ver en pantalla completa"
            onClick={openFullScreen}
            type="button"
          >
            <Expand className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-colors" />
          </button>
        )}
      </div>
    </section>
  );
}

function ProductInfo({
  nombre_promocion,
  nombre,
  precio,
  descuento,
  descripcion,
  marca,
  SKU,
  cantidad_stock,
  especificaciones,
  variations,
  id_producto_especifico,
  handleAddToCart,
  cantidad,
  setCantidad,
  stockDisponible,
}: any) {
  return (
    <section
      className="w-full max-w-xl px-4 sm:px-6 md:px-8 xl:px-10 flex flex-col border border-gray-200 shadow-xl rounded-2xl pt-6 sm:pt-8 pb-6 bg-white"
      itemScope
      itemType="https://schema.org/Product"
    >
      {nombre_promocion && (
        <div className="w-full bg-gradient-to-r from-ebony-700 to-ebony-800 text-white font-semibold py-2 px-4 text-center rounded-lg text-sm mb-4 tracking-wide shadow-md">
          {nombre_promocion}
        </div>
      )}
      <h1
        className="text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-900 leading-tight mb-3"
        itemProp="name"
      >
        {nombre}
      </h1>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-4" />
      <div className="flex w-full justify-center items-center gap-4 my-4">
        {descuento != null ? (
          <>
            <span
              className="text-2xl sm:text-3xl text-green-600 font-bold"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              S/{" "}
              <span itemProp="price">
                {(precio * (1 - descuento)).toFixed(2)}
              </span>
              <meta itemProp="priceCurrency" content="PEN" />
            </span>
            <span className="text-sm line-through text-gray-500 bg-gray-100 px-2 py-1 rounded">
              S/ {precio}
            </span>
          </>
        ) : (
          <span
            className="text-2xl sm:text-3xl text-ebony-950 font-bold"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            S/ <span itemProp="price">{precio}</span>
            <meta itemProp="priceCurrency" content="PEN" />
          </span>
        )}
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-4" />
      <p
        className="text-justify my-4 text-base sm:text-lg text-gray-700 leading-relaxed"
        itemProp="description"
      >
        {descripcion}
      </p>
      <ProductSpecs
        SKU={SKU}
        especificaciones={especificaciones}
        cantidad_stock={cantidad_stock}
        marca={marca}
        variations={variations}
        id_producto_especifico={id_producto_especifico}
      />
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-4" />
      <div className="w-full">
        <Contador
          cantidad_stock={stockDisponible}
          cantidad={cantidad}
          setCantidad={setCantidad}
        />
      </div>
      <div className="flex w-full my-6">
        <button
          onClick={handleAddToCart}
          className="w-full bg-ebony-800 text-white font-semibold py-3 px-6 text-base sm:text-lg rounded-xl hover:bg-white hover:text-ebony-800 hover:border-ebony-800 border-2 border-transparent hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-ebony-300 focus:ring-offset-2"
        >
          Añadir al carrito
        </button>
      </div>
      <div className="flex w-full my-2">
        {/* Virtual try-on button: opens the product-specific virtual try-on room */}
        {id_producto_especifico && (
          <a
            href={`/productos/${id_producto_especifico}/virtual-try-on`}
            className="w-full inline-flex justify-center items-center gap-2 border border-blue-600 text-blue-600 font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Virtual try on
          </a>
        )}
      </div>
    </section>
  );
}

function ProductSpecs({
  SKU,
  especificaciones,
  cantidad_stock,
  marca,
  variations,
  id_producto_especifico,
}: {
  SKU: string;
  especificaciones: Record<string, unknown>;
  cantidad_stock: number;
  marca?: string | null;
  variations: ProductVariationItem[];
  id_producto_especifico: number;
}) {
  return (
    <ul
      className="text-base sm:text-lg flex flex-col gap-3 mt-3"
      itemProp="additionalProperty"
      itemScope
      itemType="https://schema.org/PropertyValue"
    >
      <li className="text-gray-700 flex items-center gap-2">
        <strong className="text-gray-900">SKU:</strong>{" "}
        <span
          itemProp="value"
          className="bg-gray-100 px-2 py-1 rounded text-sm font-mono"
        >
          {SKU}
        </span>
      </li>
      {marca && (
        <li className="text-gray-700 flex items-center gap-2">
          <strong className="text-gray-900">Marca:</strong>{" "}
          <span className="bg-gray-100 px-2 py-1 rounded text-sm">
            {marca}
          </span>
        </li>
      )}
      {especificaciones &&
        Object.entries(especificaciones).map(([key, value]) => (
          <li key={key} className="text-gray-700 flex items-center gap-2">
            <strong className="text-gray-900">
              {key.charAt(0).toUpperCase() + key.slice(1)}:
            </strong>{" "}
            <span className="bg-gray-100 px-2 py-1 rounded text-sm">
              {String(value)}
            </span>
          </li>
        ))}
      <li className="text-gray-700 flex items-center gap-2">
        <strong className="text-gray-900">En stock:</strong>{" "}
        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-semibold text-sm">
          {cantidad_stock}
        </span>
      </li>
      {variations && variations.length > 0 && (
        <li>
          <ProductVariations
            variations={variations}
            selectedId={id_producto_especifico || null}
          />
        </li>
      )}
    </ul>
  );
}

function Contador({
  cantidad_stock,
  cantidad,
  setCantidad,
}: {
  cantidad_stock: number;
  cantidad: number;
  setCantidad: (n: number) => void;
}) {
  const incrementar = () => {
    if (cantidad < cantidad_stock) setCantidad(cantidad + 1);
  };

  const decrementar = () => {
    if (cantidad > 1) setCantidad(cantidad - 1);
  };

  return (
    <div className="flex items-center gap-6">
      <strong className="text-base sm:text-lg text-gray-900">Cantidad:</strong>
      <div className="flex items-center gap-4">
        <button
          onClick={decrementar}
          className="bg-gray-200 hover:bg-white hover:border-gray-400 border-2 border-transparent text-gray-700 hover:text-gray-900 font-semibold w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
          aria-label="Disminuir cantidad"
        >
          -
        </button>
        <span className="text-xl font-bold min-w-[3rem] text-center bg-gray-100 px-3 py-2 rounded-lg">
          {cantidad}
        </span>
        <button
          onClick={incrementar}
          className="bg-gray-200 hover:bg-white hover:border-gray-400 border-2 border-transparent text-gray-700 hover:text-gray-900 font-semibold w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
    </div>
  );
}

function FullScreenModal({
  isFullScreen,
  imagen_producto,
  nombre,
  closeFullScreen,
}: any) {
  if (!isFullScreen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={closeFullScreen}
      aria-modal="true"
      role="dialog"
    >
      <img
        src={
          !imagen_producto || imagen_producto === "null"
            ? "https://img.freepik.com/vector-gratis/ilustracion-icono-doodle-engranaje_53876-5596.jpg?semt=ais_hybrid&w=740"
            : imagen_producto
        }
        alt={`Imagen de ${nombre}`}
        className="max-h-[80vh] max-w-[80vw] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-200"
        onClick={closeFullScreen}
        title="Cerrar"
        aria-label="Cerrar imagen"
      >
        <X className="w-6 h-6 text-gray-700 hover:text-gray-900 transition-colors" />
      </button>
    </div>
  );
}

const ProductDetail = (props: ProductDetailProps & { variations?: any[] }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const openFullScreen = () => setIsFullScreen(true);
  const closeFullScreen = () => setIsFullScreen(false);
  const { cart, addItem } = useCart();

  // Calcular cuántos de este producto hay en el carrito
  const cantidadEnCarrito =
    cart.find((item) => item.productId === props.id_producto_especifico)
      ?.cantidad || 0;
  // Stock disponible = stock real - en carrito
  const stockDisponible = (props.cantidad_stock || 0) - cantidadEnCarrito;

  // Estado de cantidad elevado aquí
  const [cantidad, setCantidad] = useState(1);

  const handleAddToCart = async () => {
    if (props.id_producto_especifico === undefined) {
      console.error(
        "producto_id es undefined, no se puede agregar al carrito."
      );
      return;
    }

    const descuento = props.descuento ?? 0;
    const precioOriginal = props.precio ?? 0;
    const precioConDescuento = parseFloat(
      (precioOriginal * (1 - descuento)).toFixed(2)
    );

    const item: CartItem = {
      productId: props.id_producto_especifico,
      nombre: props.nombre,
      descripcion: props.descripcion || "",
      image_producto: props.imagen_producto || "",
      cantidad,
      precio: descuento ? precioConDescuento : precioOriginal,
      precioOriginal,
      descuento,
    };

    try {
      await addItem(item);
      sendGAEvent("event", "add_to_cart", {
        item_id: props.id_producto_especifico,
        item_name: props.nombre,
        category: "Productos",
        price: props.precio,
        quantity: 1,
      });
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }
  };

  return (
    <main
      className="relative font-sans bg-white container-padding"
      itemScope
      itemType="https://schema.org/Product"
    >
      <Breadcrumb {...props} isFullScreen={isFullScreen} />
      <div className="flex flex-col lg:flex-row bg-white py-8 sm:py-12 lg:py-16 relative align-middle justify-center font-sans md:gap-10 lg:gap-20 xl:gap-32">
        <ProductImage
          imagen_producto={props.imagen_producto}
          nombre={props.nombre}
          descuento={props.descuento}
          openFullScreen={openFullScreen}
          isFullScreen={isFullScreen}
        />
        <ProductInfo
          {...props}
          handleAddToCart={handleAddToCart}
          cantidad={cantidad}
          setCantidad={setCantidad}
          stockDisponible={stockDisponible}
        />
        <FullScreenModal
          isFullScreen={isFullScreen}
          imagen_producto={props.imagen_producto}
          nombre={props.nombre}
          closeFullScreen={closeFullScreen}
        />
      </div>
    </main>
  );
};

export default ProductDetail;
