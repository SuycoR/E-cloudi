export const categorias = [
  {
    id: 1,
    nombre: "Periféricos",
    subcategorias: [
      { id: 1, nombre: "Monitores", subsubcategorias: [] },
      { id: 2, nombre: "Teclados", subsubcategorias: [
        { id: 1, nombre: "mecanico" },
        { id: 2, nombre: "membrana" },
        { id: 3, nombre: "gaming" },
      ] },
      { id: 3, nombre: "Ratones", subsubcategorias: [] },
      { id: 4, nombre: "Auriculares", subsubcategorias: [] },
      { id: 5, nombre: "Micrófonos", subsubcategorias: [] },
      { id: 6, nombre: "Cámaras", subsubcategorias: [] },
      { id: 7, nombre: "Impresoras", subsubcategorias: [] },
      { id: 8, nombre: "Accesorios", subsubcategorias: [] },
    ]
  },
  {
    id: 2,
    nombre: "Componentes de computadora",
    subcategorias: [
      { id: 9, nombre: "Motherboards", subsubcategorias: [] },
      { id: 10, nombre: "Tarjetas gráficas (GPU)", subsubcategorias: [] },
      { id: 11, nombre: "Procesadores", subsubcategorias: [
        { id: 5, nombre: "Intel" },
        { id: 6, nombre: "AMD" },
      ] },
      { id: 12, nombre: "Unidades de almacenamiento", subsubcategorias: [
        { id: 7, nombre: "Discos duros (HDD)" },
        { id: 8, nombre: "Unidad de estado solido (SDD)" },
      ] },
      { id: 13, nombre: "RAM", subsubcategorias: [] },
      { id: 14, nombre: "Sistemas de refrigeración", subsubcategorias: [
        { id: 9, nombre: "Aire" },
        { id: 10, nombre: "Líquida" },
      ] },
      { id: 15, nombre: "Fuentes de poder", subsubcategorias: [] },
      { id: 16, nombre: "Cases", subsubcategorias: [] },
    ]
  }
];
