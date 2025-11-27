import { Palette, Sparkles, SunMedium, AlertTriangle } from "lucide-react";
import type { AvatarColorSwatch } from "@/types/avatar";

const metaCards = [
  {
    key: "temporada",
    label: "Temporada",
    icon: SunMedium,
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  {
    key: "tono",
    label: "Tono de piel",
    icon: Palette,
    bg: "bg-rose-50",
    text: "text-rose-700",
  },
  {
    key: "subtono",
    label: "Subtón",
    icon: Sparkles,
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
] as const;

export type ColorimetriaPanelProps = {
  temporada_palette?: string | null;
  tono_piel?: string | null;
  subtono?: string | null;
  colores_recomendados_json?: AvatarColorSwatch[];
  colores_evitar_json?: AvatarColorSwatch[];
  temporadaPalette?: string | null;
  tonoPiel?: string | null;
  coloresRecomendados?: AvatarColorSwatch[];
  coloresEvitar?: AvatarColorSwatch[];
};

function normalizeSwatches(value?: AvatarColorSwatch[] | null): AvatarColorSwatch[] {
  if (!value || !Array.isArray(value)) return [];
  return value
    .filter((item) => Boolean(item))
    .map((item) => ({
      name: item.name || "Sin nombre",
      hex: item.hex || "#f5f5f4",
    }));
}

const SWATCH_CARD_BASE = "rounded-2xl border border-white/40 bg-white/10 p-4 shadow-inner backdrop-blur";

const GRID_CLASS = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";

const EMPTY_STATE_CLASS = "flex items-center gap-3 rounded-2xl border border-dashed border-ebony-100 bg-white p-4 text-sm text-ebony-500";

const badgeClass = "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold";

const formatMeta = (value?: string | null) => value?.trim() || "Sin dato";

const ColorimetriaPanel = (props: ColorimetriaPanelProps) => {
  const temporada = props.temporadaPalette ?? props.temporada_palette ?? null;
  const tono = props.tonoPiel ?? props.tono_piel ?? null;
  const subtono = props.subtono ?? null;
  const recommended = normalizeSwatches(
    props.coloresRecomendados ?? props.colores_recomendados_json
  );
  const avoid = normalizeSwatches(
    props.coloresEvitar ?? props.colores_evitar_json
  );

  const renderSwatch = (swatch: AvatarColorSwatch, index: number) => (
    <div
      key={`${swatch.name}-${index}`}
      className={`${SWATCH_CARD_BASE} border-ebony-100 bg-white/70`}
    >
      <div
        className="h-20 w-full rounded-xl border border-white/50"
        style={{ backgroundColor: swatch.hex || "#f5f5f4" }}
      />
      <div className="mt-3 flex items-center justify-between text-sm font-semibold text-ebony-900">
        <span>{swatch.name}</span>
        <span className="text-xs text-ebony-500">{swatch.hex}</span>
      </div>
    </div>
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ebony-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-2xl">
      <div className="absolute inset-0 opacity-30" aria-hidden>
        <div className="absolute -right-12 top-10 h-44 w-44 rounded-full bg-purple-500 blur-3xl" />
        <div className="absolute -left-16 bottom-10 h-48 w-48 rounded-full bg-amber-400 blur-3xl" />
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">
            Análisis de colorimetría
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            Tu paleta personalizada
          </h2>
          <p className="mt-1 max-w-xl text-sm text-white/70">
            Revisa los tonos sugeridos por nuestro motor virtual para potenciar
            tu avatar en tiempo real.
          </p>
        </div>
        <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur">
          Actualizado automáticamente
        </div>
      </div>

      <div className="relative mt-8 grid gap-4 md:grid-cols-3">
        {metaCards.map(({ key, label, icon: Icon, bg, text }) => (
          <div key={key} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <span className={`${badgeClass} ${bg} ${text} bg-opacity-90`}>
              <Icon className="h-4 w-4" /> {label}
            </span>
            <p className="mt-3 text-xl font-semibold text-white">
              {key === "temporada" && formatMeta(temporada)}
              {key === "tono" && formatMeta(tono)}
              {key === "subtono" && formatMeta(subtono)}
            </p>
          </div>
        ))}
      </div>

      <div className="relative mt-10 space-y-10">
        <section>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-green-300">
                Colores recomendados
              </p>
              <h3 className="text-2xl font-semibold">Paleta ideal</h3>
            </div>
            <Palette className="h-5 w-5 text-green-200" />
          </div>
          <div className={`mt-4 ${GRID_CLASS}`}>
            {recommended.length > 0 ? (
              recommended.map((swatch, index) => renderSwatch(swatch, index))
            ) : (
              <div className={`${EMPTY_STATE_CLASS} col-span-full bg-white/5 text-white/60`}>
                <AlertTriangle className="h-5 w-5" />
                No hay colores sugeridos registrados para tu avatar todavía.
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-red-300">
                Colores a evitar
              </p>
              <h3 className="text-2xl font-semibold">Mantente alejada</h3>
            </div>
            <AlertTriangle className="h-5 w-5 text-red-200" />
          </div>
          <div className={`mt-4 ${GRID_CLASS}`}>
            {avoid.length > 0 ? (
              avoid.map((swatch, index) => renderSwatch(swatch, index))
            ) : (
              <div className={`${EMPTY_STATE_CLASS} col-span-full bg-white/5 text-white/60`}>
                <AlertTriangle className="h-5 w-5" />
                Aún no calculamos colores conflictivos para tu perfil.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ColorimetriaPanel;
