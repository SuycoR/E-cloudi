"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { sendGAEvent } from "@next/third-parties/google";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const router = useRouter();
  const [loading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const onSubmit = handleSubmit(async (data) => {
    
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    //console.log("res_error", res.error);
    //const isError = res?.error;
    //console.log("variable",isError)
    if (res.error === undefined) {
      sendGAEvent('event','login',{
        method: "email",
      });
      console.log("redirigiendo");
      router.push("/");
    } else {
      //alert(res?.error);
      setLoginError("Correo o contraseña incorrectos");
      reset();

    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-white p-8 rounded-xl shadow-md max-w-lg mx-auto w-full"
    >
      <h2 className="text-xl font-semibold text-ebony-900 text-center">
        Iniciar Sesión
      </h2>

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
          type="password"
          placeholder="Contraseña"
          {...register("password", {
            required: { value: true, message: "La contraseña es obligatoria" },
          })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 ${
            errors.password
              ? "border-red-400 focus:ring-red-400 focus:border-red-400"
              : "border-gray-200 focus:ring-gray-200"
          }`}
        />
        <div className="h-5">
          {typeof errors.password?.message === "string" && (
            <span className="text-red-500 text-xs font-medium">
              {errors.password.message}
            </span>
          )}
        </div>
      </div>

      {loginError && (
        <p className="text-red-500 text-sm  text-center">{loginError}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded-md transition-colors duration-200 ${
          loading
            ? "bg-ebony-800 cursor-not-allowed"
            : "bg-ebony-900 hover:bg-ebony-700 cursor-pointer text-white"
        }`}
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      <div className="text-center text-sm text-gray-700 mt-4">
        ¿Eres cliente nuevo?
      </div>
      <button
        type="button"
        onClick={() => router.push("/auth/register")}
        className="w-full py-2 rounded-md font-semibold border border-ebony-900 text-ebony-900 bg-white hover:bg-ebony-800 cursor-pointer hover:text-white transition-colors duration-200"
      >
        Crear cuenta
      </button>
    </form>
  );
}
