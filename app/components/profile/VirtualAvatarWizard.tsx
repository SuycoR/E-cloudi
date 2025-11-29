"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  Palette,
  Ruler,
  Upload,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_AVOID_COLORS,
  DEFAULT_COLOR_PROFILE,
  DEFAULT_PHOTO_SCORES,
  DEFAULT_RECOMMENDED_COLORS,
} from "@/app/constants/avatar";
import type { PhotoScore, UserAvatarRecord } from "@/types/avatar";

const steps = [
  {
    id: "photo",
    label: "Foto",
    helper: "Sube una imagen frontal",
    icon: Camera,
  },
  {
    id: "info",
    label: "Información",
    helper: "Completa tus datos básicos",
    icon: UserRound,
  },
  {
    id: "measure",
    label: "Medidas",
    helper: "Ingresa tus proporciones",
    icon: Ruler,
  },
  {
    id: "confirm",
    label: "Confirmación",
    helper: "Revisa todo antes de crear",
    icon: CheckCircle2,
  },
] as const;

type AvatarInfo = {
  genero: string;
  tipoCuerpo: string;
  altura: string;
  peso: string;
};

type AvatarMeasurements = {
  busto: string;
  cintura: string;
  cadera: string;
  hombros: string;
};

type AvatarApiResponse = {
  ok: boolean;
  avatar: UserAvatarRecord | null;
  error?: string;
};

type PhotoValidationState = {
  status: "idle" | "loading" | "approved" | "rejected" | "error";
  reasons: string[];
  tips: string[];
  scores: PhotoScore[];
};

const DEFAULT_VALIDATION_STATE: PhotoValidationState = {
  status: "idle",
  reasons: [],
  tips: [],
  scores: DEFAULT_PHOTO_SCORES,
};

const clampScore = (value: number) =>
  Math.min(100, Math.max(0, Math.round(value)));

const normalizeClientPhotoScores = (scores?: PhotoScore[] | null) => {
  if (!scores || !Array.isArray(scores) || !scores.length) {
    return DEFAULT_PHOTO_SCORES;
  }

  return scores.map((score) => ({
    label: score?.label?.trim() || "Indicador",
    value: clampScore(Number(score?.value ?? 0)),
  }));
};

const sanitizeClientList = (values?: unknown) => {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value): value is string => Boolean(value));
};

const VirtualAvatarWizard = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const modalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const validationControllerRef = useRef<AbortController | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [photoPreview, setPhotoPreview] = useState("/img/perfil.png");
  const [photoName, setPhotoName] = useState("avatar_demo.png");
  const [info, setInfo] = useState<AvatarInfo>({
    genero: "Femenino",
    tipoCuerpo: "Relajado",
    altura: "168",
    peso: "60",
  });
  const [measurements, setMeasurements] = useState<AvatarMeasurements>({
    busto: "88",
    cintura: "68",
    cadera: "96",
    hombros: "40",
  });
  const [avatarCreated, setAvatarCreated] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [savedAvatar, setSavedAvatar] = useState<UserAvatarRecord | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [photoValidation, setPhotoValidation] = useState<PhotoValidationState>(
    DEFAULT_VALIDATION_STATE
  );

  useEffect(() => {
    return () => {
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      if (validationControllerRef.current) {
        validationControllerRef.current.abort();
        validationControllerRef.current = null;
      }
    };
  }, []);

  // Llamando a la api, para guardar el avatar si es que existe
  useEffect(() => {
    let cancelled = false;

    const loadStoredAvatar = async () => {
      try {
        const response = await fetch("/api/avatar");
        if (cancelled) return;
        if (!response.ok) {
          if (response.status !== 401) {
            console.warn("No se pudo cargar el avatar guardado");
          }
          return;
        }
        const data = (await response.json()) as AvatarApiResponse;
        if (!data.avatar) return;
        setSavedAvatar(data.avatar);
        setAvatarCreated(true);
        if (data.avatar.imagenAvatar) {
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
          }
          setPhotoPreview(data.avatar.imagenAvatar);
          setPhotoName("avatar_guardado.png");
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("Error al precargar avatar", error);
        }
      }
    };

    loadStoredAvatar();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayedScores =
    savedAvatar?.calidadFoto && savedAvatar.calidadFoto.length > 0
      ? savedAvatar.calidadFoto
      : DEFAULT_PHOTO_SCORES;

  const averageScore =
    displayedScores.length > 0
      ? Math.round(
          displayedScores.reduce((acc, score) => acc + score.value, 0) /
            displayedScores.length
        )
      : 95;

  const displayedRecommended =
    savedAvatar?.coloresRecomendados &&
    savedAvatar.coloresRecomendados.length > 0
      ? savedAvatar.coloresRecomendados
      : DEFAULT_RECOMMENDED_COLORS;

  const displayedAvoid =
    savedAvatar?.coloresEvitar && savedAvatar.coloresEvitar.length > 0
      ? savedAvatar.coloresEvitar
      : DEFAULT_AVOID_COLORS;

  const paletteMeta = {
    temporada: savedAvatar?.temporadaPalette ?? DEFAULT_COLOR_PROFILE.temporada,
    tono: savedAvatar?.tonoPiel ?? DEFAULT_COLOR_PROFILE.tono,
    subtono: savedAvatar?.subtono ?? DEFAULT_COLOR_PROFILE.subtono,
  };

  const validationStatusCopy = useMemo(() => {
    switch (photoValidation.status) {
      case "approved":
        return {
          badge: "Foto validada",
          badgeClass: "bg-emerald-100 text-emerald-700",
          message: "Imagen aprobada",
          description:
            "Listo, tu foto cumple los requisitos para generar el avatar.",
        };
      case "loading":
        return {
          badge: "Analizando...",
          badgeClass: "bg-amber-100 text-amber-700",
          message: "Validando tu foto",
          description: "Nuestro modelo está revisando iluminación y postura.",
        };
      case "rejected":
        return {
          badge: "Requiere cambios",
          badgeClass: "bg-red-100 text-red-600",
          message: "La foto necesita ajustes",
          description:
            "Corrige los puntos indicados y vuelve a intentar la validación.",
        };
      case "error":
        return {
          badge: "Error",
          badgeClass: "bg-red-100 text-red-600",
          message: "No pudimos validar la foto",
          description:
            "Reintenta en unos segundos o verifica tu conexión a internet.",
        };
      default:
        return {
          badge: "Pendiente",
          badgeClass: "bg-gray-100 text-gray-600",
          message: "Foto pendiente de validación",
          description:
            "Sube una imagen frontal para que nuestro modelo la apruebe.",
        };
    }
  }, [photoValidation.status]);

  const shouldShowReasons =
    photoValidation.status !== "approved" && photoValidation.reasons.length > 0;
  const shouldShowTips =
    photoValidation.status !== "approved" && photoValidation.tips.length > 0;

  const runPhotoValidation = async (file: File) => {
    if (validationControllerRef.current) {
      validationControllerRef.current.abort();
      validationControllerRef.current = null;
    }

    const controller = new AbortController();
    validationControllerRef.current = controller;
    setPhotoValidation({
      status: "loading",
      reasons: [],
      tips: [],
      scores: [],
    });
    setStatusMessage("Validando tu foto con IA...");

    try {
      const formData = new FormData();
      formData.append("avatarImage", file);
      const response = await fetch("/api/avatar/validate", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "No pudimos validar tu foto.");
      }

      const validation = payload?.result;
      const verdict =
        validation?.verdict === "approved" ? "approved" : "rejected";
      setPhotoValidation({
        status: verdict,
        reasons: sanitizeClientList(validation?.reasons),
        tips: sanitizeClientList(validation?.tips),
        scores: normalizeClientPhotoScores(validation?.photoScores),
      });
      setStatusMessage(
        verdict === "approved"
          ? "Foto validada. Continúa con el siguiente paso."
          : "Tu foto necesita ajustes antes de continuar."
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      const message =
        error instanceof Error ? error.message : "No pudimos validar tu foto.";
      setPhotoValidation({
        status: "error",
        reasons: [message],
        tips: [],
        scores: DEFAULT_PHOTO_SCORES,
      });
      setStatusMessage(message);
    } finally {
      if (validationControllerRef.current === controller) {
        validationControllerRef.current = null;
      }
    }
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPhotoPreview(url);
    setPhotoName(file.name);
    setAvatarCreated(false);
    setUploadedFile(file);
    setShowSuccessModal(false);
    setStatusMessage(null);
    void runPhotoValidation(file);
  };

  const handleInfoChange = (
    field: keyof AvatarInfo,
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setInfo((prev) => ({ ...prev, [field]: event.target.value }));
    setAvatarCreated(false);
  };

  const handleMeasurementChange = (
    field: keyof AvatarMeasurements,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setMeasurements((prev) => ({ ...prev, [field]: event.target.value }));
    setAvatarCreated(false);
  };

  const canContinue = useMemo(() => {
    if (currentStep === 0)
      return Boolean(uploadedFile) && photoValidation.status === "approved";
    if (currentStep === 1)
      return info.genero && info.tipoCuerpo && info.altura && info.peso;
    if (currentStep === 2)
      return (
        measurements.busto &&
        measurements.cintura &&
        measurements.cadera &&
        measurements.hombros
      );
    return true;
  }, [currentStep, info, measurements, photoValidation.status, uploadedFile]);

  const goNext = () => {
    if (currentStep === steps.length - 1) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const goPrev = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const stepStatus = (index: number) => {
    if (index < currentStep) return "complete";
    if (index === currentStep) return "current";
    return "upcoming";
  };

  const handleCreateAvatar = () => {
    if (!uploadedFile) {
      setStatusMessage("Sube una foto para generar tu avatar.");
      return;
    }

    if (photoValidation.status !== "approved") {
      setStatusMessage("Valida tu foto antes de continuar con el avatar.");
      setCurrentStep(0);
      return;
    }

    const validatedScores = photoValidation.scores?.length
      ? photoValidation.scores
      : DEFAULT_PHOTO_SCORES;

    const formData = new FormData();
    formData.append("avatarImage", uploadedFile);
    formData.append("photoQuality", JSON.stringify(validatedScores));

    setIsSavingAvatar(true);
    setStatusMessage("Analizando tu colorimetría y guardando avatar...");

    fetch("/api/avatar", {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error || "No pudimos guardar tu avatar");
        }
        return (await response.json()) as AvatarApiResponse;
      })
      .then((data) => {
        setAvatarCreated(true);
        setStatusMessage("Avatar generado correctamente");
        if (data.avatar) {
          setSavedAvatar(data.avatar);
          if (data.avatar.imagenAvatar) {
            if (objectUrlRef.current) {
              URL.revokeObjectURL(objectUrlRef.current);
              objectUrlRef.current = null;
            }
            setPhotoPreview(data.avatar.imagenAvatar);
            setPhotoName("avatar_generado.png");
          }
        }
        setShowSuccessModal(true);
        if (modalTimeoutRef.current) {
          clearTimeout(modalTimeoutRef.current);
        }
        modalTimeoutRef.current = setTimeout(() => {
          router.push("/profile/mi-perfil");
        }, 2200);
      })
      .catch((error: Error) => {
        console.error("avatar creation error", error);
        setStatusMessage(error.message);
      })
      .finally(() => {
        setIsSavingAvatar(false);
      });
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "photo":
        return (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-ebony-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-ebony-600">
                    Paso 1 de 4
                  </p>
                  <h3 className="text-2xl font-semibold text-ebony-900">
                    Sube tu Foto de Cuerpo Completo
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Necesitamos una imagen donde se observe todo tu cuerpo en
                    posición frontal para crear tu avatar digital.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-600">
                  95% calidad esperada
                </span>
              </div>

              <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-ebony-200 bg-ebony-50 p-6 text-center">
                {photoPreview ? (
                  <div className="relative rounded-2xl bg-white p-4 shadow-sm">
                    <Image
                      src={photoPreview}
                      alt="Previsualización de avatar"
                      width={220}
                      height={360}
                      className="h-[360px] w-[220px] rounded-xl object-cover"
                      unoptimized
                    />
                    <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                      Listo
                    </span>
                  </div>
                ) : (
                  <div className="flex h-56 w-full flex-col items-center justify-center rounded-xl bg-white">
                    <Camera className="h-10 w-10 text-gray-400" />
                    <p className="mt-3 font-semibold text-ebony-800">
                      Arrastra tu foto aquí
                    </p>
                    <p className="text-sm text-gray-500">
                      o haz clic para seleccionarla
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full border border-ebony-200 bg-white px-4 py-2 text-sm font-semibold text-ebony-800 shadow-sm transition hover:border-ebony-300"
                  >
                    <Upload className="h-4 w-4" /> Cambiar foto
                  </button>
                  <span className="text-xs text-gray-500">{photoName}</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="mt-6 rounded-xl bg-ebony-50 p-4 text-left">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ebony-800">
                      {validationStatusCopy.message}
                    </p>
                    <p className="text-sm text-gray-500">
                      {validationStatusCopy.description}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${validationStatusCopy.badgeClass}`}
                  >
                    {validationStatusCopy.badge}
                  </span>
                </div>

                {shouldShowReasons && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                      Ajustes necesarios
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                      {photoValidation.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {shouldShowTips && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      Consejos rápidos
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                      {photoValidation.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-ebony-100 bg-white p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-ebony-900">
                Recomendaciones rápidas
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-ebony-500" />
                  Busca un fondo claro y uniforme.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-ebony-500" />
                  Mantén una postura relajada con brazos al costado.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-ebony-500" />
                  Evita prendas muy holgadas para una lectura precisa.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-ebony-500" />
                  Revisa que tu rostro esté visible.
                </li>
              </ul>
            </div>
          </div>
        );
      case "info":
        return (
          <div className="rounded-2xl border border-ebony-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-ebony-600">Paso 2 de 4</p>
            <h3 className="text-2xl font-semibold text-ebony-900">
              Información personal
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Estos datos nos ayudan a ofrecer recomendaciones de tallas más
              exactas.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-ebony-800">
                Género
                <select
                  value={info.genero}
                  onChange={(event) => handleInfoChange("genero", event)}
                  className="rounded-lg border border-ebony-100 px-3 py-2 text-gray-700 focus:border-ebony-400 focus:outline-none"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="No binario">No binario</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-ebony-800">
                Tipo de cuerpo
                <select
                  value={info.tipoCuerpo}
                  onChange={(event) => handleInfoChange("tipoCuerpo", event)}
                  className="rounded-lg border border-ebony-100 px-3 py-2 text-gray-700 focus:border-ebony-400 focus:outline-none"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Relajado">Relajado</option>
                  <option value="Atlético">Atlético</option>
                  <option value="Curvilíneo">Curvilíneo</option>
                  <option value="Recto">Recto</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-ebony-800">
                Altura (cm)
                <input
                  type="number"
                  value={info.altura}
                  onChange={(event) => handleInfoChange("altura", event)}
                  className="rounded-lg border border-ebony-100 px-3 py-2 text-gray-700 focus:border-ebony-400 focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-ebony-800">
                Peso (kg)
                <input
                  type="number"
                  value={info.peso}
                  onChange={(event) => handleInfoChange("peso", event)}
                  className="rounded-lg border border-ebony-100 px-3 py-2 text-gray-700 focus:border-ebony-400 focus:outline-none"
                />
              </label>
            </div>
          </div>
        );
      case "measure":
        return (
          <div className="rounded-2xl border border-ebony-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-ebony-600">Paso 3 de 4</p>
            <h3 className="text-2xl font-semibold text-ebony-900">Medidas</h3>
            <p className="mt-2 text-sm text-gray-500">
              Comparte tus medidas clave para ajustar las recomendaciones del
              probador virtual.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {Object.entries(measurements).map(([key, value]) => (
                <label
                  key={key}
                  className="flex flex-col gap-2 text-sm font-medium capitalize text-ebony-800"
                >
                  {key}
                  <input
                    type="number"
                    value={value}
                    onChange={(event) =>
                      handleMeasurementChange(
                        key as keyof AvatarMeasurements,
                        event
                      )
                    }
                    className="rounded-lg border border-ebony-100 px-3 py-2 text-gray-700 focus:border-ebony-400 focus:outline-none"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-ebony-50 p-4 text-sm text-gray-600">
              <p>
                Consejo: utiliza una cinta métrica flexible y anota las medidas
                en centímetros para lograr la precisión que ves en las vistas de
                confirmación.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="rounded-2xl border border-ebony-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-ebony-600">Paso 4 de 4</p>
            <h3 className="text-2xl font-semibold text-ebony-900">
              ¡Tu avatar está listo para generarse!
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Revisa la información final y confirma para crear el avatar con
              nuestra experiencia de try-on.
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-2xl border border-ebony-100 bg-ebony-50 p-4 text-center">
                <Image
                  src={photoPreview}
                  alt="Avatar final"
                  width={220}
                  height={360}
                  className="mx-auto h-[320px] w-[200px] rounded-xl object-cover"
                  unoptimized
                />
                <p className="mt-4 text-sm font-semibold text-emerald-600">
                  Precisión estimada 92%
                </p>
                <p className="text-xs text-gray-500">{photoName}</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-ebony-100 bg-white p-4">
                  <div className="flex items-center gap-2 text-ebony-900">
                    <UserRound className="h-5 w-5" />
                    <h4 className="font-semibold">Información personal</h4>
                  </div>
                  <dl className="mt-3 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                    <div>
                      <dt className="font-medium text-ebony-700">Género</dt>
                      <dd>{info.genero || "No especificado"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-ebony-700">
                        Tipo de cuerpo
                      </dt>
                      <dd>{info.tipoCuerpo || "No especificado"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-ebony-700">Altura</dt>
                      <dd>
                        {info.altura ? `${info.altura} cm` : "No especificado"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-ebony-700">Peso</dt>
                      <dd>
                        {info.peso ? `${info.peso} kg` : "No especificado"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-ebony-100 bg-white p-4">
                  <div className="flex items-center gap-2 text-ebony-900">
                    <Ruler className="h-5 w-5" />
                    <h4 className="font-semibold">Medidas detalladas</h4>
                  </div>
                  <dl className="mt-3 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                    {Object.entries(measurements).map(([key, value]) => (
                      <div key={key} className="capitalize">
                        <dt className="font-medium text-ebony-700">{key}</dt>
                        <dd>{value ? `${value} cm` : "No especificado"}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <p className="font-semibold">¿Qué sigue?</p>
                  <p>
                    Podrás probar looks virtuales, recibir tallas recomendadas y
                    guardar tus favoritos en segundos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-ebony-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-ebony-600">
              Configuración inicial
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-3xl font-semibold text-ebony-900">
                Crear mi avatar virtual
              </h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-ebony-50 px-4 py-2 text-sm font-semibold text-ebony-700">
                <Palette className="h-4 w-4" /> Modo claro
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Sigue los pasos para configurar tu avatar y desbloquear la
              experiencia de try-on de forma inmediata.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const status = stepStatus(index);
                const isComplete = status === "complete";
                const isCurrent = status === "current";
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold transition ${
                        isComplete
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                          : isCurrent
                          ? "border-ebony-400 bg-white text-ebony-900"
                          : "border-ebony-100 bg-ebony-50 text-gray-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          isComplete || isCurrent
                            ? "text-ebony-900"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-500">{step.helper}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <ChevronRight className="hidden h-4 w-4 text-gray-300 lg:block" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="h-1 rounded-full bg-ebony-50">
              <div
                className="h-full rounded-full bg-ebony-600 transition-all"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {renderStepContent()}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentStep === 0}
          className="inline-flex items-center gap-2 rounded-full border border-ebony-200 bg-white px-4 py-2 text-sm font-semibold text-ebony-700 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
        >
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>

        <div className="flex gap-3">
          {currentStep < steps.length - 1 && (
            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 rounded-full bg-ebony-800 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ebony-900 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Continuar <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {currentStep === steps.length - 1 && (
            <button
              type="button"
              onClick={handleCreateAvatar}
              disabled={isSavingAvatar}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isSavingAvatar ? "Guardando..." : "Crear mi avatar"}
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <p className="text-sm text-ebony-600">{statusMessage}</p>
      )}

      {avatarCreated && (
        <div className="rounded-2xl border border-ebony-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-ebony-600">
              Precisión del avatar
            </p>
            <h3 className="text-2xl font-semibold text-ebony-900">
              Mi avatar virtual
            </h3>
            <p className="text-sm text-gray-500">
              Actualiza tu imagen, consulta la paleta recomendada y guarda tus
              looks favoritos.
            </p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-ebony-100 bg-ebony-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ebony-700">
                    Calidad de foto
                  </p>
                  <p className="text-3xl font-bold text-ebony-900">
                    {Number.isFinite(averageScore) ? averageScore : 95}
                  </p>
                  <p className="text-xs text-gray-500">Precisión Excelente</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ebony-700">
                  Foto validada
                </span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {displayedScores.map((score) => (
                  <div
                    key={score.label}
                    className="rounded-xl bg-white p-4 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-ebony-700">
                      {score.label}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-ebony-900">
                        {score.value}%
                      </span>
                      <span className="text-xs text-gray-500">optimizado</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-ebony-50">
                      <div
                        className="h-full rounded-full bg-ebony-700"
                        style={{ width: `${score.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="rounded-full border border-ebony-200 bg-white px-4 py-2 text-sm font-semibold text-ebony-800">
                  Actualizar foto
                </button>
                <button className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600">
                  Eliminar avatar
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-ebony-100 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ebony-700">
                    Análisis de colorimetría
                  </p>
                  <p className="text-xs text-gray-500">
                    Tu paleta personalizada en base a tu tono de piel
                  </p>
                </div>
                <Palette className="h-5 w-5 text-ebony-600" />
              </div>

              <div className="mt-6 grid gap-3 text-sm text-ebony-800 md:grid-cols-3">
                <div className="rounded-xl bg-ebony-50 p-3 text-center">
                  <p className="font-semibold">Temporada</p>
                  <p className="text-ebony-600">{paletteMeta.temporada}</p>
                </div>
                <div className="rounded-xl bg-ebony-50 p-3 text-center">
                  <p className="font-semibold">Tono de piel</p>
                  <p className="text-ebony-600">{paletteMeta.tono}</p>
                </div>
                <div className="rounded-xl bg-ebony-50 p-3 text-center">
                  <p className="font-semibold">Subtono</p>
                  <p className="text-ebony-600">{paletteMeta.subtono}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-ebony-900">
                  Colores recomendados
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-6">
                  {displayedRecommended.map((color) => (
                    <div
                      key={color.name}
                      className="text-center text-xs font-medium"
                    >
                      <div
                        className="h-14 w-full rounded-xl border border-ebony-100"
                        style={{ backgroundColor: color.hex }}
                      />
                      <p className="mt-1 text-gray-600">{color.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-ebony-900">
                  Colores a evitar
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {displayedAvoid.map((color) => (
                    <div
                      key={color.name}
                      className="text-center text-xs font-medium"
                    >
                      <div
                        className="h-14 w-full rounded-xl border border-ebony-100"
                        style={{ backgroundColor: color.hex }}
                      />
                      <p className="mt-1 text-gray-600">{color.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="mt-4 text-xl font-semibold text-ebony-900">
              ¡Avatar generado!
            </h4>
            <p className="mt-2 text-sm text-gray-600">
              Guardamos tu avatar en la nube. Te redireccionaremos a &ldquo;Mi
              perfil&rdquo; para que puedas administrarlo.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  if (modalTimeoutRef.current) {
                    clearTimeout(modalTimeoutRef.current);
                    modalTimeoutRef.current = null;
                  }
                  router.push("/profile/mi-perfil");
                }}
                className="rounded-full bg-ebony-900 px-5 py-2 text-sm font-semibold text-white"
              >
                Ir a Mi perfil
              </button>
              <button
                type="button"
                onClick={() => {
                  if (modalTimeoutRef.current) {
                    clearTimeout(modalTimeoutRef.current);
                    modalTimeoutRef.current = null;
                  }
                  setShowSuccessModal(false);
                }}
                className="rounded-full border border-ebony-200 px-5 py-2 text-sm font-semibold text-ebony-800"
              >
                Seguir aquí
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualAvatarWizard;
