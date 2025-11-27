"use client";
import React, { useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import {
  DEFAULT_AVOID_COLORS,
  DEFAULT_COLOR_PROFILE,
  DEFAULT_PHOTO_SCORES,
  DEFAULT_RECOMMENDED_COLORS,
} from "@/app/constants/avatar";
import type { UserAvatarRecord } from "@/types/avatar";

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
  const router = useRouter();
  const [toggleEdit, setToggleEdit] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarData, setAvatarData] = useState<UserAvatarRecord | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [avatarUpdating, setAvatarUpdating] = useState(false);
  const [avatarDeleting, setAvatarDeleting] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);

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
  
// Para setear la imagen del avatar en caso tengas
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch("/api/avatar");
        if (!response.ok) {
          setAvatarData(null);
          return;
        }
        const json = await response.json();
        setAvatarData(json.avatar ?? null);
      } catch (error) {
        console.error("Error al cargar avatar", error);
        setAvatarMessage("No pudimos cargar tu avatar.");
      } finally {
        setAvatarLoading(false);
      }
    };

    fetchAvatar();
  }, []);

  const handleTriggerAvatarUpload = () => {
    avatarFileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarUpdating(true);
    setAvatarMessage("Actualizando avatar...");

    try {
      const formData = new FormData();
      formData.append("avatarImage", file);
      formData.append(
        "photoQuality",
        JSON.stringify(
          avatarData?.calidadFoto?.length
            ? avatarData.calidadFoto
            : DEFAULT_PHOTO_SCORES
        )
      );
      formData.append(
        "coloresRecomendados",
        JSON.stringify(
          avatarData?.coloresRecomendados?.length
            ? avatarData.coloresRecomendados
            : DEFAULT_RECOMMENDED_COLORS
        )
      );
      formData.append(
        "coloresEvitar",
        JSON.stringify(
          avatarData?.coloresEvitar?.length
            ? avatarData.coloresEvitar
            : DEFAULT_AVOID_COLORS
        )
      );
      formData.append(
        "temporadaPalette",
        avatarData?.temporadaPalette ?? DEFAULT_COLOR_PROFILE.temporada
      );
      formData.append(
        "tonoPiel",
        avatarData?.tonoPiel ?? DEFAULT_COLOR_PROFILE.tono
      );
      formData.append(
        "subtono",
        avatarData?.subtono ?? DEFAULT_COLOR_PROFILE.subtono
      );

      const response = await fetch("/api/avatar", {
        method: avatarData ? "PUT" : "POST",
        body: formData,
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "No pudimos actualizar tu avatar");
      }

      setAvatarData(json.avatar ?? null);
      setAvatarMessage("Avatar actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar avatar", error);
      setAvatarMessage(
        error instanceof Error ? error.message : "Error al actualizar avatar"
      );
    } finally {
      setAvatarUpdating(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleDeleteAvatar = async () => {
    setAvatarDeleting(true);
    setAvatarMessage("Eliminando avatar...");
    try {
      const response = await fetch("/api/avatar", { method: "DELETE" });
      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.error || "No pudimos eliminar el avatar");
      }
      setAvatarData(null);
      setAvatarMessage("Avatar eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar avatar", error);
      setAvatarMessage(
        error instanceof Error ? error.message : "Error al eliminar avatar"
      );
    } finally {
      setAvatarDeleting(false);
    }
  };

  const handleModifyAvatar = () => {
    router.push("/profile/avatar-virtual");
  };

  const avatarPreview = avatarData?.imagenAvatar || "/img/perfil.png";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <User className="text-black-600" size={28} />
        Mi perfil
      </h1>

      <section className="mb-8">
        <div className="rounded-2xl border border-ebony-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="overflow-hidden rounded-2xl border border-ebony-100 bg-ebony-50 p-3">
              {avatarLoading ? (
                <div className="flex h-72 w-48 items-center justify-center text-sm text-gray-500">
                  Cargando avatar...
                </div>
              ) : (
                <Image
                  src={avatarPreview}
                  alt="Avatar virtual"
                  width={240}
                  height={360}
                  className="h-72 w-48 rounded-xl object-cover"
                  unoptimized
                />
              )}
            </div>
            <p className="text-xs text-gray-500">
              {avatarData?.createDate
                ? `Actualizado el ${new Date(
                    avatarData.createDate
                  ).toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}`
                : "Sube una foto frontal para generar tu avatar."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleTriggerAvatarUpload}
                disabled={avatarUpdating}
                className="rounded-full border border-ebony-200 bg-white px-5 py-2 text-sm font-semibold text-ebony-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {avatarUpdating ? "Actualizando..." : "Actualizar foto"}
              </button>
              <button
                type="button"
                onClick={handleDeleteAvatar}
                disabled={avatarDeleting || !avatarData}
                className="rounded-full border border-red-200 bg-white px-5 py-2 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {avatarDeleting ? "Eliminando..." : "Eliminar avatar"}
              </button>
              <button
                type="button"
                onClick={handleModifyAvatar}
                className="rounded-full bg-ebony-900 px-5 py-2 text-sm font-semibold text-white"
              >
                Modificar avatar
              </button>
            </div>
            {avatarMessage && (
              <p className="text-xs text-gray-500">{avatarMessage}</p>
            )}
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
          </div>
        </div>
      </section>

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
