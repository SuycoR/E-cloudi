"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { crearDireccion } from "../../utils/direccionHandlers"; // ajusta la ruta
import { updateDireccionHandler } from "../../utils/updateDireccionHandler";


interface Distrito {
  id: number;
  nombre: string;
}

interface Provincia {
  id: number;
  nombre: string;
  distritos: Distrito[];
}

interface Departamento {
  id: number;
  nombre: string;
  provincias: Provincia[];
}

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

interface FormularioDireccionProps {
  direccion: Direccion | null;
  onClose: (shouldRefresh?: boolean) => void; // ✅ Modificado para recibir el parámetro
}

const FormularioDireccion = ({ direccion, onClose }: FormularioDireccionProps) => {
  const { data: session } = useSession();

  const [ubicaciones, setUbicaciones] = useState<Departamento[]>([]);
  const [departamentoId, setDepartamentoId] = useState<number | null>(null);
  const [provinciaId, setProvinciaId] = useState<number | null>(null);

  type DireccionFormFields = Omit<Direccion, 'id' | 'isPrimary'>;

  const [formData, setFormData] = useState<DireccionFormFields>({
    piso: direccion?.piso || "",
    lote: direccion?.lote || "",
    calle: direccion?.calle || "",
    distrito: direccion?.distrito || "",
    provincia: direccion?.provincia || "",
    departamento: direccion?.departamento || "",
    codigo_postal: direccion?.codigo_postal || "",
  });

  useEffect(() => {
    fetch("/api/ubicaciones")
      .then(res => res.json())
      .then((data: { departamentos: Departamento[] }) => {
        setUbicaciones(data.departamentos);

        const dep = data.departamentos.find((d) => d.nombre === direccion?.departamento);
        if (dep) {
          setDepartamentoId(dep.id);
          const prov = dep.provincias.find((p) => p.nombre === direccion?.provincia);
          if (prov) setProvinciaId(prov.id);
        }
      });
  }, [direccion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    const departamento = ubicaciones.find(d => d.id === id);
    setDepartamentoId(id);
    setProvinciaId(null);
    setFormData(prev => ({
      ...prev,
      departamento: departamento?.nombre || "",
      provincia: "",
      distrito: ""
    }));
  };

  const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    const provincia = ubicaciones.find(d => d.id === departamentoId)?.provincias.find(p => p.id === id);
    setProvinciaId(id);
    setFormData(prev => ({
      ...prev,
      provincia: provincia?.nombre || "",
      distrito: ""
    }));
  };

  const handleDistritoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distrito = e.target.value;
    setFormData(prev => ({ ...prev, distrito }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      console.error("Usuario no autenticado");
      return;
    }

    const usuarioId = Number(session.user.id);
    if (isNaN(usuarioId)) {
      console.error("ID de usuario inválido");
      return;
    }

    let resultado;
    if (direccion?.id) {
      resultado = await updateDireccionHandler({
        direccion_id: direccion.id,
        usuario_id: usuarioId,
        piso: formData.piso || "",
        lote: formData.lote || "",
        calle: formData.calle || "",
        distrito: formData.distrito || "",
        codigo_postal: formData.codigo_postal || "",
      });
    } else {
      resultado = await crearDireccion(formData, usuarioId);
    }

    if (resultado && typeof resultado !== "string" && resultado.ok) {
      // ✅ Cerrar el modal y refrescar las direcciones
      onClose(true);
    } else {
      alert(typeof resultado === "string" ? resultado : resultado?.mensaje || "Ocurrió un error.");
    }
  };

  // ✅ Función para manejar el cancelar
  const handleCancel = () => {
    onClose(false); // Cerrar sin refrescar
  };

  const provincias = ubicaciones.find(d => d.id === departamentoId)?.provincias || [];
  const distritos = provincias.find(p => p.id === provinciaId)?.distritos || [];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white p-6 rounded-lg w-full sm:w-96">
        <h1 className="text-2xl font-bold mb-4">{direccion ? "Editar Dirección" : "Añadir Dirección"}</h1>
        <form onSubmit={handleSubmit}>
          {(["piso", "lote", "calle", "codigo_postal"] as (keyof DireccionFormFields)[]).map((campo) => (
            <input
              key={campo}
              type="text"
              name={campo}
              value={formData[campo] || ""}
              onChange={handleChange}
              placeholder={campo.replace("_", " ").toUpperCase()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            />
          ))}

          <select value={departamentoId || ""} onChange={handleDepartamentoChange} className="w-full px-3 py-2 border rounded-md mb-4">
            <option value="">Selecciona Departamento</option>
            {ubicaciones.map(dep => (
              <option key={dep.id} value={dep.id}>{dep.nombre}</option>
            ))}
          </select>

          <select value={provinciaId || ""} onChange={handleProvinciaChange} className="w-full px-3 py-2 border rounded-md mb-4">
            <option value="">Selecciona Provincia</option>
            {provincias.map(prov => (
              <option key={prov.id} value={prov.id}>{prov.nombre}</option>
            ))}
          </select>

          <select value={formData.distrito || ""} onChange={handleDistritoChange} className="w-full px-3 py-2 border rounded-md mb-4">
            <option value="">Selecciona Distrito</option>
            {distritos.map(dist => (
              <option key={dist.id} value={dist.nombre}>{dist.nombre}</option>
            ))}
          </select>
          {/*<div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="isPrimary"
              name="isPrimary"
              checked={formData.isPrimary}
              onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="isPrimary" className="text-sm">Establecer como dirección principal</label>
          </div>
          */}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-500">
            {direccion ? "Guardar Cambios" : "Añadir Dirección"}
          </button>  
          
        </form>
        
        <button
          onClick={handleCancel}
          className="w-full bg-gray-300 text-black py-2 rounded-md mt-4 hover:bg-gray-400"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default FormularioDireccion;