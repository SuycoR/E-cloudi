"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Tag,
  Check,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Calendar,
  Package2,
  DollarSign,
} from "lucide-react";
import { usePromotion } from "@/app/context/PromotionContext";

interface Subcategoria {
  id: number;
  nombre: string;
  subcategorias?: Subcategoria[];
}

interface Categoria {
  id: number;
  nombre: string;
  cantidad_productos?: number;
  subcategorias?: Subcategoria[];
}

interface Producto {
  id: number;
  nombre: string;
  SKU: string;
  precio: number;
  categoria: string;
  imagen?: string;
  fecha_registro?: string; // Nueva propiedad
  stock?: number; // Nueva propiedad
}

export default function PromocionProductSelector() {
  // 1️⃣ contexto para la selección
  const {
    destino,
    setDestino,
    subcategoriasSeleccionadas,
    setSubcategoriasSeleccionadas,
    promotionDraft,
  } = usePromotion();

  // 2️⃣ estado local para datos a cargar
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // 3️⃣ búsquedas y UI
  const [busquedaProducto, setBusquedaProducto] = useState("");

  // 4️⃣ estado para categorías expandidas
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Set<number>>(
    new Set()
  );

  // 5️⃣ Estados para confirmación y envío
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // 6️⃣ Nuevos estados para las opciones adicionales
  const [filtrosFecha, setFiltrosFecha] = useState({
    fechaDesde: "",
    fechaHasta: "",
  });
  const [filtrosStock, setFiltrosStock] = useState({
    stockMinimo: "",
    stockMaximo: "",
  });
  const [filtrosPrecios, setFiltrosPrecios] = useState({
    precioMinimo: "",
    precioMaximo: "",
  });

  // Cargar categorías desde la API
  useEffect(() => {
    async function cargar() {
      setLoading(true);
      try {
        const [r1] = await Promise.all([fetch("/api/categorias")]);
        setCategorias(await r1.json());
      } catch {
        alert("Error cargando datos.");
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  // Cargar productos desde la API
  useEffect(() => {
    async function fetchFiltrados() {
      setLoading(true);
      try {
        const qs = new URLSearchParams();

        // subcategorías (cuando tipo === 'CATEGORIA')
        if (subcategoriasSeleccionadas.size) {
          qs.append(
            "subcategoriaIds",
            Array.from(subcategoriasSeleccionadas).join(",")
          );
        }

        // stock

        if (filtrosStock.stockMinimo)
          qs.append("stockMinimo", filtrosStock.stockMinimo);
        if (filtrosStock.stockMaximo)
          qs.append("stockMaximo", filtrosStock.stockMaximo);

        // precio

        if (filtrosPrecios.precioMinimo)
          qs.append("precioMinimo", filtrosPrecios.precioMinimo);
        if (filtrosPrecios.precioMaximo)
          qs.append("precioMaximo", filtrosPrecios.precioMaximo);

        
        // fecha
        if (destino.tipo === "FECHA_LLEGADA") {
          if (filtrosFecha.fechaDesde)
            qs.append("fechaDesde", filtrosFecha.fechaDesde);
          if (filtrosFecha.fechaHasta)
            qs.append("fechaHasta", filtrosFecha.fechaHasta);
        }

        const url = `/api/productos/especificos?${qs.toString()}`;
        console.log("Cargando productos filtrados desde:", url);
        const res = await fetch(url);
        if (!res.ok) throw new Error("Fetch fail");
        const data: Producto[] = await res.json();
        setProductos(data);
      } catch {
        alert("Error cargando productos filtrados");
      } finally {
        setLoading(false);
      }
    }

    fetchFiltrados();
    // ⚠️ Pon aquí **todos** los estados de filtro de los que dependa la consulta:
  }, [
    destino.tipo,
    filtrosStock.stockMinimo,
    filtrosStock.stockMaximo,
    filtrosPrecios.precioMinimo,
    filtrosPrecios.precioMaximo,
    filtrosFecha.fechaDesde,
    filtrosFecha.fechaHasta,
    subcategoriasSeleccionadas, // para que detecte cambios
  ]);

  // 8️⃣ Filtrar productos por múltiples criterios
  const productosFiltrados = productos.filter((p) => {
    // Filtro por texto
    const coincideTexto = p.nombre
      .toLowerCase()
      .includes(busquedaProducto.toLowerCase());

    // Filtro por fecha de llegada (solo para tipos FECHA_LLEGADA)
    let coincideFecha = true;
    if (destino.tipo === "FECHA_LLEGADA") {
      if (filtrosFecha.fechaDesde && p.fecha_registro) {
        coincideFecha =
          coincideFecha &&
          new Date(p.fecha_registro) >= new Date(filtrosFecha.fechaDesde);
      }
      if (filtrosFecha.fechaHasta && p.fecha_registro) {
        coincideFecha =
          coincideFecha &&
          new Date(p.fecha_registro) <= new Date(filtrosFecha.fechaHasta);
      }
    }

    // Filtro por stock (solo para tipos STOCK)
    let coincideStock = true;
    if (destino.tipo === "STOCK") {
      if (filtrosStock.stockMinimo && p.stock !== undefined) {
        coincideStock =
          coincideStock && p.stock >= parseInt(filtrosStock.stockMinimo);
      }
      if (filtrosStock.stockMaximo && p.stock !== undefined) {
        coincideStock =
          coincideStock && p.stock <= parseInt(filtrosStock.stockMaximo);
      }
    }

    // Filtro por precios (solo para tipos PRECIO)
    let coincidePrecio = true;
    if (destino.tipo === "PRECIO") {
      if (filtrosPrecios.precioMinimo) {
        coincidePrecio =
          coincidePrecio && p.precio >= parseFloat(filtrosPrecios.precioMinimo);
      }
      if (filtrosPrecios.precioMaximo) {
        coincidePrecio =
          coincidePrecio && p.precio <= parseFloat(filtrosPrecios.precioMaximo);
      }
    }

    return coincideTexto && coincideFecha && coincideStock && coincidePrecio;
  });

  // 9️⃣ Helpers de toggle
  const toggleCategoria = (id: number) => {
    if (destino.tipo !== "CATEGORIA") return;

    const nuevasExpandidas = new Set(categoriasExpandidas);
    if (nuevasExpandidas.has(id)) {
      nuevasExpandidas.delete(id);
    } else {
      nuevasExpandidas.add(id);
    }
    setCategoriasExpandidas(nuevasExpandidas);
  };

  const toggleSubcategoria = (subcategoriaId: number) => {
    const nuevasSubcategorias = new Set(subcategoriasSeleccionadas);
    if (nuevasSubcategorias.has(subcategoriaId)) {
      nuevasSubcategorias.delete(subcategoriaId);
    } else {
      nuevasSubcategorias.add(subcategoriaId);
    }
    setSubcategoriasSeleccionadas(nuevasSubcategorias);
  };

  const toggleProducto = (id: number) => {
    if (
      ["PRODUCTO", "FECHA_LLEGADA", "STOCK", "PRECIO"].includes(destino.tipo)
    ) {
      // selección directa para todos los tipos de producto
      const ids = destino.ids.includes(id)
        ? destino.ids.filter((x) => x !== id)
        : [...destino.ids, id];
      setDestino({ ...destino, ids });
    } else {
      // exclusiones cuando elegimos por categoría
      const ids = destino.ids.includes(id)
        ? destino.ids.filter((x) => x !== id)
        : [...destino.ids, id];
      setDestino({ tipo: "CATEGORIA", ids });
    }
  };

  // Función para renderizar solo subcategorías de nivel 2
  const renderSubcategorias = (subcategorias: Subcategoria[]) => {
    return subcategorias.map((sub) => {
      return (
        <div key={`sub-${sub.id}`}>
          <div
            onClick={() => toggleSubcategoria(sub.id)}
            className={`p-3 border rounded cursor-pointer mb-2 ${
              subcategoriasSeleccionadas.has(sub.id)
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{sub.nombre}</span>
              {subcategoriasSeleccionadas.has(sub.id) && (
                <Check className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  // Función helper para encontrar una subcategoría por ID en todas las categorías
  const encontrarSubcategoria = (subcategoriaId: number) => {
    for (const categoria of categorias) {
      if (categoria.subcategorias) {
        const subcategoria = categoria.subcategorias.find(
          (s) => s.id === subcategoriaId
        );
        if (subcategoria) {
          return { subcategoria, categoria };
        }
      }
    }
    return null;
  };

  const isValid = () =>
    ["CATEGORIA", "PRODUCTO", "FECHA_LLEGADA", "STOCK", "PRECIO"].includes(
      destino.tipo
    ) && destino.ids.length > 0;

  // 🔟 navegación de pasos
  const [, setPaso] = useState(2);
  const goBack = () => setPaso(1);

  // Función para preparar datos de confirmación
  const prepararDatosConfirmacion = () => {
    const subcategoriasConNombres = Array.from(subcategoriasSeleccionadas)
      .map((subcategoriaId) => {
        const resultado = encontrarSubcategoria(subcategoriaId);
        return resultado
          ? {
              id: subcategoriaId,
              nombre: resultado.subcategoria.nombre,
              categoria_padre: resultado.categoria.nombre,
            }
          : null;
      })
      .filter(Boolean);

    const productosSeleccionados = [
      "PRODUCTO",
      "FECHA_LLEGADA",
      "STOCK",
      "PRECIO",
    ].includes(destino.tipo)
      ? destino.ids
          .map((prodId) => {
            const prod = productos.find((p) => p.id === prodId);
            return prod
              ? {
                  id: prodId,
                  nombre: prod.nombre,
                  precio: prod.precio,
                  fecha_llegada: prod.fecha_registro,
                  stock: prod.stock,
                }
              : null;
          })
          .filter(Boolean)
      : [];

    return {
      subcategoriasConNombres,
      productosSeleccionados,
    };
  };

  const goNext = () => {
    if (!isValid()) return alert("Selecciona al menos un ítem.");
    setMostrarConfirmacion(true);
  };

  // Función para confirmar y enviar
  const confirmarYEnviar = async () => {
    setEnviando(true);

    const { subcategoriasConNombres } = prepararDatosConfirmacion();

    console.log("=== INFORMACIÓN COMPLETA DE LA PROMOCIÓN ===");
    console.log("📝 Datos básicos:");
    console.log("  - Nombre:", promotionDraft.nombre);
    console.log("  - Descripción:", promotionDraft.descripcion);
    console.log("  - Imagen:", promotionDraft.img_promocional);
    console.log("  - Fecha inicio:", promotionDraft.fecha_inicio);
    console.log("  - Fecha fin:", promotionDraft.fecha_fin);
    console.log(
      "  - Porcentaje descuento:",
      promotionDraft.porcentaje_descuento
    );

    console.log("\n🎯 Aplicación:");
    console.log(
      "\n Subcategorías seleccionadas: ",
      subcategoriasConNombres.map((s) => s!.nombre).join(", ")
    );
    console.log("Filtro por stock: ", filtrosStock);
    console.log("Filtro por precios: ", filtrosPrecios);
    console.log("  - IDs seleccionados:", destino.ids.join(", "));

    const body = {
      nombre: promotionDraft.nombre,
      descripcion: promotionDraft.descripcion,
      fecha_inicio: promotionDraft.fecha_inicio,
      fecha_fin: promotionDraft.fecha_fin,
      img_promocional: promotionDraft.img_promocional,
      porcentaje_descuento: promotionDraft.porcentaje_descuento,
      nivel: promotionDraft.nivel,
      combinable: promotionDraft.combinable,
      destino: {
        tipo: destino.tipo, // 'CATEGORIA' | 'PRODUCTO'
        ids: destino.ids, // [1,2,3…]
      },
      // solo si estás en categoría
      subcategorias:
        destino.tipo === "CATEGORIA"
          ? Array.from(subcategoriasSeleccionadas)
          : undefined,
    };

    try {
      const response = await fetch("/api/promociones/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Error al crear la promoción:", data);
        throw new Error(data.error || "Error desconocido");
      }

      console.log("✅ Promoción creada exitosamente:", data);
      setEnviado(true);
      setTimeout(() => {
        setMostrarConfirmacion(false);
        setPaso(3);
      }, 1500);
    } catch (error) {
      console.error(error);
      alert("Error al crear la promoción");
    } finally {
      setEnviando(false);
    }
  };

  // Función para limpiar selecciones al cambiar de tipo
  const handleTipoChange = (
    nuevoTipo: "CATEGORIA" | "PRODUCTO" | "FECHA_LLEGADA" | "STOCK" | "PRECIO"
  ) => {
    setDestino({ tipo: nuevoTipo, ids: [] });

    {
      /*  if (nuevoTipo !== "CATEGORIA") {
      setSubcategoriasSeleccionadas(new Set());
    }
    setCategoriasExpandidas(new Set());
    
    // Limpiar filtros cuando cambiamos de tipo
    setFiltrosFecha({ fechaDesde: "", fechaHasta: "" });
    setFiltrosStock({ stockMinimo: "", stockMaximo: "" });
    setFiltrosPrecios({ precioMinimo: "", precioMaximo: "" });
    setBusquedaProducto(""); */
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 mx-auto mb-4 border-b-2 border-blue-600 rounded-full" />
        Cargando…
      </div>
    );

  const { subcategoriasConNombres, productosSeleccionados } =
    prepararDatosConfirmacion();

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded shadow">
      <header className="flex items-center mb-6">
        <h2 className="text-2xl font-bold">
          Seleccionar Productos para la Promoción
        </h2>
      </header>

      {/* Opciones de Tipo */}
      <section className="mb-6">
        <h3 className="font-semibold mb-3">Método de Selección</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              checked={destino.tipo === "CATEGORIA"}
              onChange={() => handleTipoChange("CATEGORIA")}
              className="mr-3"
            />
            <Tag className="w-4 h-4 mr-2" />
            <span className="text-sm">Por Categoría</span>
          </label>

          <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              checked={destino.tipo === "FECHA_LLEGADA"}
              onChange={() => handleTipoChange("FECHA_LLEGADA")}
              className="mr-3"
            />
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">Por Fecha de Llegada</span>
          </label>

          <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              checked={destino.tipo === "STOCK"}
              onChange={() => handleTipoChange("STOCK")}
              className="mr-3"
            />
            <Package2 className="w-4 h-4 mr-2" />
            <span className="text-sm">Por Stock</span>
          </label>

          <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              checked={destino.tipo === "PRECIO"}
              onChange={() => handleTipoChange("PRECIO")}
              className="mr-3"
            />
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="text-sm">Por Rango de Precios</span>
          </label>
        </div>
      </section>

      {/* Categorías */}
      {destino.tipo === "CATEGORIA" && (
        <section className="mb-6">
          <h3 className="font-semibold mb-2">Selecciona Categorías</h3>
          <div className="space-y-0">
            {categorias.map((c) => (
              <div key={c.id} className="rounded-lg p-2">
                <div
                  onClick={() => toggleCategoria(c.id)}
                  className={`p-4 border rounded cursor-pointer flex items-center justify-between ${
                    categoriasExpandidas.has(c.id)
                      ? "border-gray-300 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    {c.subcategorias &&
                      c.subcategorias.length > 0 &&
                      (categoriasExpandidas.has(c.id) ? (
                        <ChevronDown className="w-4 h-4 mr-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-2" />
                      ))}
                    <span className="font-medium">{c.nombre}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {c.cantidad_productos ?? 0} productos
                  </p>
                </div>

                {categoriasExpandidas.has(c.id) &&
                  c.subcategorias &&
                  c.subcategorias.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        Subcategorías:
                      </h4>
                      {renderSubcategorias(c.subcategorias)}
                    </div>
                  )}
              </div>
            ))}
          </div>

          {subcategoriasSeleccionadas.size > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Subcategorías seleccionadas:</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(subcategoriasSeleccionadas).map(
                  (subcategoriaId) => {
                    const resultado = encontrarSubcategoria(subcategoriaId);
                    if (!resultado) return null;

                    return (
                      <span
                        key={subcategoriaId}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                      >
                        {resultado.subcategoria.nombre}
                      </span>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Filtros por Fecha de Llegada */}
      {destino.tipo === "FECHA_LLEGADA" && (
        <section className="mb-6">
          <h3 className="font-semibold mb-2">
            Seleccione el intervalo de fecha de llegada
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={filtrosFecha.fechaDesde}
                onChange={(e) =>
                  setFiltrosFecha({
                    ...filtrosFecha,
                    fechaDesde: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filtrosFecha.fechaHasta}
                onChange={(e) =>
                  setFiltrosFecha({
                    ...filtrosFecha,
                    fechaHasta: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          {filtrosFecha.fechaDesde && filtrosFecha.fechaHasta && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              Mostrando productos con fecha de llegada entre{" "}
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                {" "}
                {new Date(filtrosFecha.fechaDesde).toLocaleDateString()}
              </span>
              {" y "}
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                {new Date(filtrosFecha.fechaHasta).toLocaleDateString()}
              </span>
            </div>
          )}
        </section>
      )}

      {/* Filtros por Stock */}
      {destino.tipo === "STOCK" && (
        <section className="mb-6">
          <h3 className="font-semibold mb-2">Filtrar por Stock</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Stock Mínimo
              </label>
              <input
                type="number"
                value={filtrosStock.stockMinimo}
                onChange={(e) =>
                  setFiltrosStock({
                    ...filtrosStock,
                    stockMinimo: e.target.value,
                  })
                }
                placeholder="Ej: 10"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Stock Máximo
              </label>
              <input
                type="number"
                value={filtrosStock.stockMaximo}
                onChange={(e) =>
                  setFiltrosStock({
                    ...filtrosStock,
                    stockMaximo: e.target.value,
                  })
                }
                placeholder="Ej: 100"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          {filtrosStock.stockMinimo && filtrosStock.stockMaximo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              Mostrando productos con stock entre{" "}
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                {filtrosStock.stockMinimo} unidades
              </span>
              {" y "}
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                {filtrosStock.stockMaximo} unidades
              </span>
            </div>
          )}
        </section>
      )}

      {/* Filtros por Precio */}
      {destino.tipo === "PRECIO" && (
        <section className="mb-6">
          <h3 className="font-semibold mb-2">Filtrar por Rango de Precios</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Precio Mínimo ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={filtrosPrecios.precioMinimo}
                onChange={(e) =>
                  setFiltrosPrecios({
                    ...filtrosPrecios,
                    precioMinimo: e.target.value,
                  })
                }
                placeholder="Ej: 10.00"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Precio Máximo ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={filtrosPrecios.precioMaximo}
                onChange={(e) =>
                  setFiltrosPrecios({
                    ...filtrosPrecios,
                    precioMaximo: e.target.value,
                  })
                }
                placeholder="Ej: 500.00"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          {filtrosPrecios.precioMinimo && filtrosPrecios.precioMaximo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              Mostrando productos con precio entre{" "}
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                ${filtrosPrecios.precioMinimo}
              </span>
              {" y "}
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                ${filtrosPrecios.precioMaximo}
              </span>
            </div>
          )}
        </section>
      )}

      {/* Lista de Productos para selección individual */}
      {["CATEGORIA", "PRODUCTO", "FECHA_LLEGADA", "STOCK", "PRECIO"].includes(
        destino.tipo
      ) && (
        <section className="mb-6">
          <h3 className="font-semibold mb-2">
            {destino.tipo === "PRODUCTO"
              ? "Selecciona Productos"
              : destino.tipo === "FECHA_LLEGADA"
              ? "Productos por Fecha de Llegada"
              : destino.tipo === "STOCK"
              ? "Productos por Stock"
              : "Productos por Precio"}
          </h3>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full pl-10 py-2 border rounded"
            />
          </div>

          <div className="text-sm text-gray-600 mb-2">
            Mostrando {productosFiltrados.length} producto(s)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-auto">
            {productosFiltrados.map((p) => (
              <div
                key={p.id}
                onClick={() => toggleProducto(p.id)}
                className={`p-4 border rounded cursor-pointer ${
                  destino.ids.includes(p.id)
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="font-medium">{p.nombre}</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      <p className="text-sm text-gray-500">{p.SKU}</p>
                      <p className="text-sm text-gray-500">
                        Precio: ${p.precio}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stock: {p.stock} unidades
                      </p>
                      <p className="text-sm text-gray-500">
                        Fecha de llegada: {p.fecha_registro}  
                      </p>
                    </div>
                  </div>
                  {destino.ids.includes(p.id) && (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron productos con los filtros aplicados
            </div>
          )}
        </section>
      )}

      {/* Resumen de selección */}
      {destino.ids.length > 0 &&
        ["CATEGORIA", "PRODUCTO", "FECHA_LLEGADA", "STOCK", "PRECIO"].includes(
          destino.tipo
        ) && (
          <section className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">
              Productos seleccionados: {destino.ids.length}
            </h4>
            <div className="flex flex-wrap gap-2">
              {destino.ids.slice(0, 5).map((prodId) => {
                const prod = productos.find((p) => p.id === prodId);
                return prod ? (
                  <span
                    key={prodId}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                  >
                    {prod.nombre}
                  </span>
                ) : null;
              })}
              {destino.ids.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                  +{destino.ids.length - 5} más
                </span>
              )}
            </div>
          </section>
        )}

      {/* Footer */}
      <footer className="flex justify-end space-x-3">
        <button
          onClick={goBack}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Volver
        </button>
        <button
          onClick={goNext}
          disabled={!isValid()}
          className={`px-4 py-2 text-white rounded ${
            isValid()
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Siguiente
        </button>
      </footer>

      {/* Modal de Confirmación */}
      {mostrarConfirmacion && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            {!enviado ? (
              <>
                <div className="flex items-center mb-4">
                  <AlertCircle className="w-6 h-6 text-orange-500 mr-2" />
                  <h3 className="text-xl font-bold">
                    Confirmar Creación de Promoción
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Datos básicos */}
                  <div className="border rounded p-4">
                    <h4 className="font-semibold mb-2 text-blue-600">
                      📝 Datos Básicos
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <strong>Nombre:</strong> {promotionDraft.nombre}
                      </div>
                      <div>
                        <strong>Descripción:</strong>{" "}
                        {promotionDraft.descripcion}
                      </div>
                      <div>
                        <strong>Imagen:</strong>{" "}
                        {promotionDraft.img_promocional || "No especificada"}
                      </div>
                      <div>
                        <strong>Fecha inicio:</strong>{" "}
                        {promotionDraft.fecha_inicio}
                      </div>
                      <div>
                        <strong>Fecha fin:</strong> {promotionDraft.fecha_fin}
                      </div>
                      <div>
                        <strong>Porcentaje descuento:</strong>{" "}
                        {promotionDraft.porcentaje_descuento}%
                      </div>
                    </div>
                  </div>

                  {/* Aplicación */}
                  <div className="border rounded p-4">
                    <h4 className="font-semibold mb-2 text-green-600">
                      🎯 Aplicación
                    </h4>
                    <div className="text-sm">
                      <div className="mb-2">
                        {/* Subcategorías */}
                        {subcategoriasConNombres.length > 0 && (
                          <div>
                            <strong>Subcategorías:</strong>{" "}
                            {subcategoriasConNombres
                              .map((s) => s!.nombre)
                              .join(", ")}
                          </div>
                        )}
                        {/* Stock */}
                        {(filtrosStock.stockMinimo ||
                          filtrosStock.stockMaximo) && (
                          <div>
                            <strong>Stock:</strong>{" "}
                            {filtrosStock.stockMinimo && (
                              <>Mínimo {filtrosStock.stockMinimo}</>
                            )}
                            {filtrosStock.stockMaximo && (
                              <>, Máximo {filtrosStock.stockMaximo}</>
                            )}
                          </div>
                        )}
                        {/* Precio */}
                        {(filtrosPrecios.precioMinimo ||
                          filtrosPrecios.precioMaximo) && (
                          <div>
                            <strong>Precio:</strong>{" "}
                            {filtrosPrecios.precioMinimo && (
                              <>Desde ${filtrosPrecios.precioMinimo}</>
                            )}
                            {filtrosPrecios.precioMaximo && (
                              <>, Hasta ${filtrosPrecios.precioMaximo}</>
                            )}
                          </div>
                        )}
                      </div>
                      {productosSeleccionados.length > 0 && (
                        <div>
                          <strong>Productos seleccionados:</strong>
                          <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                            {productosSeleccionados.map((prod) => (
                              <div
                                key={prod!.id}
                                className="flex justify-between text-xs bg-gray-50 p-2 rounded"
                              >
                                <div className="flex-1">
                                  <span>
                                    {prod?.id} - {prod!.nombre}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setMostrarConfirmacion(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                    disabled={enviando}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarYEnviar}
                    disabled={enviando}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                  >
                    {enviando ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full" />
                        Creando...
                      </>
                    ) : (
                      "Confirmar y Crear Promoción"
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-600 mb-2">
                  ¡Promoción Creada Exitosamente!
                </h3>
                <p className="text-gray-600">
                  La promoción ha sido guardada correctamente.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
