import Image from "next/image";
import Link from "next/link";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import VirtualAvatarWizard from "@/app/components/profile/VirtualAvatarWizard";
import ColorimetriaPanel from "@/app/components/profile/ColorimetriaPanel";
import { getUserAvatarRecord } from "@/lib/avatarStorage";
import type { UserAvatarRecord } from "@/types/avatar";

export const dynamic = "force-dynamic";

const REQUIRED_AZURE_VARS = [
  "CONF_AZURE_ENDPOINT",
  "CONF_AZURE_API_KEY",
  "CONF_AZURE_DEPLOYMENT",
  "CONF_API_VERSION",
];

type SearchParamsInput =
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>;

type PageProps = {
  searchParams?: SearchParamsInput;
};

const AvatarVirtualPage = async ({ searchParams }: PageProps) => {
  const resolvedSearchParams = searchParams
    ? await Promise.resolve(searchParams)
    : {};

  const avatar = await getStoredAvatar();
  const forceWizard =
    resolvedSearchParams?.regenerar === "1" ||
    (Array.isArray(resolvedSearchParams?.regenerar)
      ? resolvedSearchParams.regenerar.includes("1")
      : false);
  const hasStoredAvatar = Boolean(avatar);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-ebony-600">Avatar virtual</p>
        <h1 className="text-3xl font-semibold text-ebony-900">
          {hasStoredAvatar && !forceWizard
            ? "Tu avatar ya está listo"
            : "Diseña tu avatar en minutos"}
        </h1>
        <p className="text-sm text-gray-500">
          {hasStoredAvatar && !forceWizard
            ? "Consulta tu panel de colorimetría personalizado y gestiona tu experiencia de try-on."
            : "Sigue la guía paso a paso para subir tu foto, completar tu información y recibir recomendaciones de colorimetría."}
        </p>
        {process.env.NODE_ENV !== "production" && (
          <p className="text-xs text-gray-400">
            La colorimetría IA usa las variables {REQUIRED_AZURE_VARS.join(
              ", "
            )} definidas en tu archivo .env.
          </p>
        )}
      </header>

      {avatar && !forceWizard ? (
        <ExistingAvatarView avatar={avatar} />
      ) : (
        <VirtualAvatarWizard />
      )}
    </section>
  );
};

const ExistingAvatarView = ({
  avatar,
}: {
  avatar: UserAvatarRecord;
}) => {
  const averageScore = avatar.calidadFoto?.length
    ? Math.round(
        avatar.calidadFoto.reduce((acc, score) => acc + score.value, 0) /
          avatar.calidadFoto.length
      )
    : null;

  const recordedAt = avatar.createDate
    ? new Intl.DateTimeFormat("es-PE", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(avatar.createDate))
    : null;

  const photoSrc = avatar.imagenAvatar ?? "/img/perfil.png";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ColorimetriaPanel
          temporadaPalette={avatar.temporadaPalette}
          tonoPiel={avatar.tonoPiel}
          subtono={avatar.subtono}
          coloresRecomendados={avatar.coloresRecomendados}
          coloresEvitar={avatar.coloresEvitar}
        />

        <div className="rounded-3xl border border-ebony-100 bg-white p-6 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-ebony-500">
            Estado del avatar
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-ebony-900">
            Perfil sincronizado
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Edita tu configuración o regenera tu avatar cuando lo necesites.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-ebony-50 bg-ebony-900/90">
            <div className="relative h-64 w-full">
              <Image
                src={photoSrc}
                alt="Avatar guardado"
                fill
                className="object-contain"
                sizes="400px"
                priority
                unoptimized
              />
              <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ebony-800">
                Avatar en vivo
              </div>
              {averageScore !== null && (
                <div className="absolute bottom-4 left-4 rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white">
                  Precisión {averageScore}%
                </div>
              )}
            </div>
          </div>

          <dl className="mt-6 space-y-4 text-sm text-ebony-700">
            {recordedAt && (
              <div className="flex items-center justify-between rounded-xl bg-ebony-50 px-4 py-3">
                <dt className="font-medium text-ebony-500">Actualizado el</dt>
                <dd className="font-semibold">{recordedAt}</dd>
              </div>
            )}
            <div className="flex items-center justify-between rounded-xl bg-ebony-50 px-4 py-3">
              <dt className="font-medium text-ebony-500">Colores sugeridos</dt>
              <dd className="font-semibold">
                {avatar.coloresRecomendados.length || "Sin registro"}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-ebony-50 px-4 py-3">
              <dt className="font-medium text-ebony-500">Colores a evitar</dt>
              <dd className="font-semibold">
                {avatar.coloresEvitar.length || "Sin registro"}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/profile/mi-perfil"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-ebony-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-ebony-950"
            >
              Administrar en Mi perfil
            </Link>
            <Link
              href="/profile/avatar-virtual?regenerar=1"
              className="inline-flex flex-1 items-center justify-center rounded-full border border-ebony-200 px-4 py-2 text-sm font-semibold text-ebony-800 hover:border-ebony-400"
            >
              Crear nuevo avatar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

async function getStoredAvatar() {
  const session = await auth();
  const rawId = session?.user?.id;
  const userId = rawId ? Number(rawId) : NaN;
  if (!Number.isFinite(userId)) {
    return null;
  }

  return getUserAvatarRecord(userId);
}

export default AvatarVirtualPage;
