"use client";

import { categorias } from "@/lib/categorias";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CategoryBox() {
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  const toggle = (key: string, isLevel1 = false) => {
    setOpen((prev) => {
      const updated = isLevel1
        ? Object.keys(prev).reduce((acc, k) => {
            if (k.startsWith("1-")) acc[k] = false;
            return acc;
          }, { ...prev } as { [key: string]: boolean })
        : { ...prev };

      return { ...updated, [key]: !prev[key] };
    });
  };

  const handleClick = (level: number, id: number) => {
    router.push(`/categoria/${level}/${id}`);
  };

  return (
    <aside className="w-64 p-4 bg-white border-r border-gray-200">
      <h2 className="text-white bg-red-600 px-2 py-1 font-bold mb-4">CATEGORÍAS</h2>

      {categorias.map((cat1) => {
        const key1 = `1-${cat1.id}`;

        return (
          <div key={cat1.id} className="mb-2">
            <button
              onClick={() => toggle(key1, true)}
              className="w-full text-left font-semibold"
            >
              {cat1.nombre} {open[key1] ? "▲" : "▼"}
            </button>

            {open[key1] && (
              <ul className="ml-4 mt-1">
                {cat1.subcategorias.map((cat2) => {
                  const key2 = `2-${cat2.id}`;

                  return (
                    <li key={cat2.id}>
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleClick(2, cat2.id)}
                          className="text-sm hover:underline"
                        >
                          {cat2.nombre}
                        </button>

                        {cat2.subsubcategorias?.length > 0 && (
                          <button
                            onClick={() => toggle(key2)}
                            className="text-xs"
                          >
                            {open[key2] ? "▲" : "▼"}
                          </button>
                        )}
                      </div>

                      {open[key2] && cat2.subsubcategorias?.length > 0 && (
                        <ul className="ml-4 mt-1">
                          {cat2.subsubcategorias.map((cat3) => (
                            <li key={cat3.id}>
                              <button
                                onClick={() => handleClick(3, cat3.id)}
                                className="text-xs hover:underline"
                              >
                                {cat3.nombre}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </aside>
  );
}
