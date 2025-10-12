"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  //es para redirigir a otra URL
  const Router = useRouter();
  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await fetch("/api/auth/register",
        {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      //console.log("debugging");
      //console.log(response);
      if (response.ok) {
        sendGAEvent("event", "sign_up", 
          {
            method: "email",
          });
        Router.push('/auth/login');
      }
    }
    catch {

    }
  });

  const password = watch("contrasena");

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-white p-8 rounded-xl shadow-md max-w-lg mx-auto w-full"
    >
      <h2 className="text-xl font-semibold text-ebony-900 text-center">Crear cuenta</h2>

      <div className="space-y-1">
        <input
          type="text"
          placeholder="Nombre"
          {...register("nombre", {
            required: { value: true, message: "El nombre es obligatorio" },
          })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
            errors.nombre 
              ? "border-red-400 focus:ring-red-400 focus:border-red-400" 
              : "border-gray-200 focus:ring-gray-200"
          }`}
        />
        <div className="h-5">
          {typeof errors.nombre?.message === "string" && (
            <span className="text-red-500 text-xs font-medium">
              {errors.nombre.message}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <input
          type="text"
          placeholder="Apellido"
          {...register("apellido", {
            required: { value: true, message: "El apellido es obligatorio" },
          })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
            errors.apellido 
              ? "border-red-400 focus:ring-red-400 focus:border-red-400" 
              : "border-gray-200 focus:ring-gray-200"
          }`}
        />
        <div className="h-5">
          {typeof errors.apellido?.message === "string" && (
            <span className="text-red-500 text-xs font-medium">
              {errors.apellido.message}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <select
          {...register("tipo_identificacion", {
            required: { value: true, message: "Selecciona un tipo de identificación" },
          })}
          className={`w-full px-4 py-2 border rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 transition-colors duration-200 ${
            errors.tipo_identificacion 
              ? "border-red-400 focus:ring-red-400 focus:border-red-400" 
              : "border-gray-200 focus:ring-gray-200"
          }`}
        >
          <option value="">Selecciona tipo de identificación</option>
          <option value="DNI">DNI</option>
          <option value="Carnet de extranjeria">Carnet de extranjería</option>
        </select>
        <div className="h-5">
          {typeof errors.tipo_identificacion?.message === "string" && (
            <span className="text-red-500 text-xs font-medium">
              {errors.tipo_identificacion.message}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <input
          type="text"
          placeholder="Número de Identificación"
          {...register("identificacion", {
            required: { value: true, message: "El número de identificación es obligatorio" },
          })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
            errors.identificacion 
              ? "border-red-400 focus:ring-red-400 focus:border-red-400" 
              : "border-gray-200 focus:ring-gray-200"
          }`}
        />
        <div className="h-5">
          {typeof errors.identificacion?.message === "string" && (
            <span className="text-red-500 text-xs font-medium">
              {errors.identificacion.message}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <input
          type="email"
          placeholder="Correo electrónico"
          {...register("email", {
            required: { value: true, message: "El correo es obligatorio" },
          })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
            errors.email 
              ? "border-red-400 focus:ring-red-400 focus:border-red-400" 
              : "border-gray-200 focus:ring-gray-200"
          }`}
        />
        <div className="h-5">
          {typeof errors.email?.message === "string" && (
            <span className="text-red-500 text-xs font-medium">
              {errors.email.message}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <input
          type="tel"
          placeholder="Teléfono"
          {...register("telefono", {
            required: { value: true, message: "El teléfono es obligatorio" },
            minLength: { value: 9, message: "Debe tener 9 dígitos" },
            maxLength: { value: 9, message: "Debe tener 9 dígitos" },
            pattern: { value: /^[0-9]+$/, message: "Solo se permiten números" },
          })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
            errors.telefono 
              ? "border-red-400 focus:ring-red-400 focus:border-red-400" 
              : "border-gray-200 focus:ring-gray-200"
          }`}
        />
        <div className="h-5">
          {typeof errors.telefono?.message === "string" && (
            <span className="text-red-500 text-xs font-medium">
              {errors.telefono.message}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <input
          type="password"
          placeholder="Contraseña"
          {...register("contrasena", {
            required: { value: true, message: "La contraseña es obligatoria" },
          })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
            errors.contrasena 
              ? "border-red-400 focus:ring-red-400 focus:border-red-400" 
              : "border-gray-200 focus:ring-gray-200"
          }`}
        />
        <div className="h-5">
          {typeof errors.contrasena?.message === "string" && (
            <span className="text-red-500 text-xs font-medium">
              {errors.contrasena.message}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <input
          type="password"
          placeholder="Confirmar contraseña"
          {...register("confirmPassword", {
            required: { value: true, message: "Confirma tu contraseña" },
            validate: (value) =>
              value === password || "Las contraseñas no coinciden",
          })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
            errors.confirmPassword 
              ? "border-red-400 focus:ring-red-400 focus:border-red-400" 
              : "border-gray-200 focus:ring-gray-200"
          }`}
        />
        <div className="h-5">
          {typeof errors.confirmPassword?.message === "string" && (
            <span className="text-red-500 text-xs font-medium">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2 rounded-md transition-colors duration-200 bg-ebony-900 hover:bg-ebony-800 cursor-pointer text-white"
      >
        Registrarse
      </button>


    </form>
  );
}