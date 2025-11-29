"use client";
import React, { useState, useEffect } from "react";

const columns = [
  {
    title: "Comp Ecommerce",
    content: (
      <>
        <div>
          <span className="font-bold">Ventas</span> 957199045 - 957199044 -
          990174476-949570056 - 926478449 - 997114752 - 9872349132
        </div>
        <div>
          <span className="font-bold">Email :</span> ventasEcommerce@BD.com
        </div>
        <div>
          <span className="font-bold">Direccion :</span> Av Amenezaga 341,
          Cercado de Lima (pt 51)
        </div>
        <img
          src="https://coolboxpe.vtexassets.com/arquivos/libro-reclamaciones.jpg"
          alt="Libro de Reclamaciones"
          className="w-32 mt-2 rounded shadow"
        />
      </>
    ),
    priority: 1,
  },
  {
    title: "Sobre nosotros",
    content: (
      <>
        <a href="#" className="hover:underline text-gray-200">
          ¿Quiénes somos?
        </a>
        <a href="#" className="hover:underline text-gray-200">
          Canales de atención
        </a>
        <a href="#" className="hover:underline text-gray-200">
          Compra fácil y seguro
        </a>
      </>
    ),
    priority: 2,
  },
  {
    title: "Información",
    content: (
      <>
        <a href="#" className="hover:underline text-gray-200">
          Términos y condiciones
        </a>
        <a href="#" className="hover:underline text-gray-200">
          Nuestra Empresa
        </a>
        <a href="#" className="hover:underline text-gray-200">
          Medios de Pago
        </a>
        <div className="font-bold mt-3 mb-1">Políticas</div>
        <a href="#" className="hover:underline text-gray-200">
          Política de Cookies
        </a>
        <a href="#" className="hover:underline text-gray-200">
          Política de Privacidad de Datos Personales
        </a>
        <a href="#" className="hover:underline text-gray-200">
          Política de Envío
        </a>
        <a href="#" className="hover:underline text-gray-200">
          Política de Garantías
        </a>
      </>
    ),
    priority: 3,
  },
  {
    title: "Servicios al cliente",
    content: (
      <>
        <a href="#" className="hover:underline text-gray-200">
          Monitores
        </a>
        <a href="#" className="hover:underline text-gray-200">
          Ratones
        </a>
        <a href="#" className="hover:underline text-gray-200">
          Teclados
        </a>
        <a href="#" className="hover:underline text-gray-200">
          Auriculares
        </a>
        <a href="#" className="hover:underline text-gray-200">
          Procesadores
        </a>
        <a href="#" className="hover:underline text-gray-200 ml-3">
          Unidades de almacenamiento
        </a>
      </>
    ),
    priority: 4,
  },
  {
    title: "Destacados",
    content: (
      <>
        <a href="#" className="hover:underline text-gray-200">
          Mis compras
        </a>
        <a href="#" className="hover:underline text-gray-200">
          Outlet
        </a>
        <a href="#" className="hover:underline text-gray-200">
          Cyber Wow
        </a>
      </>
    ),
    priority: 5,
  },
];

const columnVisibility = [
  "block", // Siempre visible
  "sm:block", // Desde sm
  "md:block", // Desde md
  "lg:block", // Desde lg
  "xl:block", // Desde xl
];

const Footer = () => {
  const [currentYear, setCurrentYear] = useState<string>("2025");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer
      className="bg-ebony-950 text-white text-sm relative"
      role="contentinfo"
      aria-label="Pie de página"
    >
      {/* Botón tipo pestaña */}
      <div className="w-full flex justify-center -translate-y-1/2 absolute top-0 left-0 pointer-events-none z-10">
        <button
          className="pointer-events-auto bg-ebony-950 rounded-t-xl px-6 py-2 font-semibold flex items-center gap-2"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-controls="footer-content"
          aria-label={
            expanded
              ? "Ocultar información del pie de página"
              : "Mostrar información del pie de página"
          }
        >
          {expanded ? "Ocultar" : "Mostrar"}
          <span className="ml-2">{expanded ? "▼" : "▲"}</span>
        </button>
      </div>

      {/* Contenido expandible */}
      <div
        id="footer-content"
        className={`transition-all duration-300 overflow-hidden mx-auto container-padding pt-10 max-w-7xl`}
        aria-hidden={!expanded}
      >
        {/* Cuando está contraído: solo los títulos en una sola fila, si no caben, no se muestran */}
        {!expanded && (
          <div className="w-full flex-nowrap flex justify-center items-center gap-8 overflow-x-auto hide-scrollbar min-h-[40px]">
            {columns.map((col, idx) => (
              <span
                key={col.title}
                className={`font-bold whitespace-nowrap px-2 ${columnVisibility[idx]}`}
              >
                {col.title}
              </span>
            ))}
          </div>
        )}

        {/* Cuando está expandido: columnas completas */}
        {expanded && (
          <>
            <div className="flex flex-wrap gap-8 justify-between">
              {columns.map((col, idx) => (
                <div
                  key={col.title}
                  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex flex-col gap-2 ${columnVisibility[idx]}`}
                >
                  <div className="font-bold mb-1">{col.title}</div>
                  <div className="flex flex-col">{col.content}</div>
                </div>
              ))}
            </div>
            {/* Métodos de pago solo si está expandido */}
            <div className="w-full flex flex-col items-center md:items-end py-4">
              <div className="bg-[#22263a] rounded-lg px-6 py-3 flex items-center gap-4 shadow">
                <span className="text-gray-300 text-xs">Métodos de pago</span>
                <img
                  src="https://crystalpng.com/wp-content/uploads/2025/02/visa-logo-02.png"
                  alt="Visa"
                  className="h-6"
                />
                <img
                  src="https://www.mastercard.com/content/dam/public/mastercardcom/pe/es/logos/mastercard-og-image.png"
                  alt="Mastercard"
                  className="h-6"
                />
                <img
                  src="https://marketing-peru.beglobal.biz/wp-content/uploads/2024/06/1-yape-logo-transparencia-2.png"
                  alt="Yape"
                  className="h-6"
                />
                <img
                  src="https://logosenvector.com/logo/img/plin-interbank-4391.png"
                  alt="Plin"
                  className="h-6"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png"
                  alt="Bitcoin"
                  className="h-6"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Línea y derechos */}
      <div className="border-t border-gray-700 mt-4 py-4 text-center text-xs text-gray-200 px-2">
        © {currentYear} Ecommerce. Todos los derechos reservados. &nbsp;/&nbsp;
        <span className="font-semibold">RUC: 1273483232</span> &nbsp;/&nbsp;
        <span className="font-semibold">Razón Social: Choclos S.A.C</span>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
