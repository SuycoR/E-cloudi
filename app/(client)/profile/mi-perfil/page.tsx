"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User } from "lucide-react";


// Extend the User type temporarily
interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  surname?: string | null;
  phone?: string | null;
  typeDocument?: string | null;
  documentId?: string | null;
}

export default function MiPerfilPage() {
  const { data: session } = useSession();
  const [toggleEdit, setToggleEdit] = useState(false);
  
  // Cast the user to our extended type
  const user = session?.user as ExtendedUser;


  const [formData, setFormData] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
    phone: user?.phone || "",
    typeDocument: user?.typeDocument || "",
    documentId: user?.documentId || "",
  });

  // Actualizar formData cuando session cambie
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        phone: user.phone || "",
        typeDocument: user.typeDocument || "",
        documentId: user.documentId || "",
      });
    }
  }, [user]);

  // Manejar cambios en los inputs
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Manejar cancelar edición
  const handleCancel = () => {
    // Restaurar valores originales
    if (user) {
      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        phone: user.phone || "",
        typeDocument: user.typeDocument || "",
        documentId: user.documentId || "",
      });
    }
    setToggleEdit(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/usuario", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: session?.user?.id, // Asegúrate que exista
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Error al guardar");
      }

      const data = await response.json();
      console.log({
        id: session?.user?.id, // Asegúrate que exista
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        phone: formData.phone,
      });
      console.log("Usuario actualizado:", data.message);
      setToggleEdit(false);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("Hubo un error al guardar los cambios");
    }
  };

  return (
    <div>
      {/* ...existing code... */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <User className="text-black-600" size={28} />
        Mi perfil
      </h1>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ebony-500 ${
                !toggleEdit ? "bg-ebony-50" : "bg-white"
              }`}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={user?.name || "Tu nombre"}
              disabled={toggleEdit === false}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ebony-500 ${
                !toggleEdit ? "bg-ebony-50" : "bg-white"
              }`}
              value={formData.surname}
              onChange={(e) => handleInputChange("surname", e.target.value)}
              placeholder={user?.surname || "Tu apellido"}
              disabled={toggleEdit === false}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico
          </label>
          <input
            type="email"
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ebony-500 ${
              !toggleEdit ? "bg-ebony-50" : "bg-white"
            }`}
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder={user?.email || "Tu correo electrónico"}
            disabled={toggleEdit === false}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ebony-500 ${
                !toggleEdit ? "bg-ebony-50" : "bg-white"
              }`}
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+1 234 567 8900"
              disabled={toggleEdit === false}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documento de identidad
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full pl-16 pr-3 py-2 bg-ebony-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ebony-500"
                value={formData.documentId || ""}
                onChange={(e) =>
                  handleInputChange("documentId", e.target.value)
                }
                placeholder="12345678"
                disabled={true}
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-ebony-800 text-white px-2 py-1 rounded text-xs font-medium">
                {formData.typeDocument || "DNI"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          {!toggleEdit ? (
            <button
              className="bg-ebony-900 text-white px-6 py-2 rounded-md hover:bg-ebony-800 cursor-pointer transition-colors"
              onClick={() => setToggleEdit(!toggleEdit)}
            >
              Editar información
            </button>
          ) : (
            <div className="flex gap-6">
              <button
                className="bg-red-700 text-white px-6 py-2 rounded-md hover:bg-red-800 cursor-pointer transition-colors"
                onClick={handleCancel}
              >
                Cancelar
              </button>
              <button
                className="bg-ebony-900 text-white px-6 py-2 rounded-md hover:bg-ebony-800 cursor-pointer transition-colors"
                onClick={handleSave}
              >
                Guardar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
