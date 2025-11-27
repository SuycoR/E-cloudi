import { Palette, Sparkles, SunMedium, AlertTriangle } from "lucide-react";
import type { AvatarColorSwatch } from "@/types/avatar";

const metaCards = [
  {
    key: "temporada",
    label: "Temporada",
    icon: SunMedium,
    badgeColors: "bg-[#cdffff] text-[#006691]",
  },
  {
    key: "tono",
    label: "Tono de piel",
    icon: Palette,
    badgeColors: "bg-[#94e7ff] text-[#0b2c3f]",
  },
  {
    key: "subtono",
    label: "Subtón",
    icon: Sparkles,
    badgeColors: "bg-[#40cfff]/20 text-[#006691]",
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

const SWATCH_CARD_BASE =
  "rounded-2xl border border-[#94e7ff]/60 bg-white p-4 shadow-lg shadow-[#006691]/10";

const GRID_CLASS = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";

const EMPTY_STATE_CLASS =
  "flex items-center gap-3 rounded-2xl border border-dashed border-[#94e7ff]/70 bg-[#f3fbff] p-4 text-sm text-[#0b2c3f]/70";

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
      className={`${SWATCH_CARD_BASE} border-transparent`}
    >
      <div
        className="h-20 w-full rounded-xl border border-[#cdffff] shadow-inner"
        style={{ backgroundColor: swatch.hex || "#f5f5f4" }}
      />
      <div className="mt-3 flex items-center justify-between text-sm font-semibold text-[#0b2c3f]">
        <span>{swatch.name}</span>
        <span className="text-xs text-[#0b2c3f]/70">{swatch.hex}</span>
      </div>
    </div>
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#cdffff] bg-white p-6 text-[#0b2c3f] shadow-2xl">
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
        <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-gradient-to-br from-[#94e7ff] to-[#cdffff] blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-gradient-to-br from-[#40cfff]/60 to-transparent blur-3xl" />
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#2499c7]">
            Análisis de colorimetría
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[#0b2c3f]">
            Tu paleta personalizada
          </h2>
          <p className="mt-1 max-w-xl text-sm text-[#0b2c3f]/70">
            Revisa los tonos sugeridos por nuestro motor virtual para potenciar
            tu avatar en tiempo real.
          </p>
        </div>
        <div className="rounded-full border border-[#94e7ff] bg-[#cdffff]/60 px-4 py-2 text-sm font-semibold text-[#0b2c3f] backdrop-blur">
          Actualizado automáticamente
        </div>
      </div>

      <div className="relative mt-8 grid gap-4 md:grid-cols-3">
        {metaCards.map(({ key, label, icon: Icon, badgeColors }) => (
          <div key={key} className="rounded-2xl border border-[#cdffff] bg-gradient-to-br from-[#f6fdff] to-white p-4 shadow-sm">
            <span className={`${badgeClass} ${badgeColors}`}>
              <Icon className="h-4 w-4" /> {label}
            </span>
            <p className="mt-3 text-xl font-semibold text-[#0b2c3f]">
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
              <p className="text-sm uppercase tracking-[0.3em] text-[#2499c7]">
                Colores recomendados
              </p>
              <h3 className="text-2xl font-semibold text-[#0b2c3f]">Paleta ideal</h3>
            </div>
            <Palette className="h-5 w-5 text-[#006691]" />
          </div>
          <div className={`mt-4 ${GRID_CLASS}`}>
            {recommended.length > 0 ? (
              recommended.map((swatch, index) => renderSwatch(swatch, index))
            ) : (
              <div className={`${EMPTY_STATE_CLASS} col-span-full`}>
                <AlertTriangle className="h-5 w-5" />
                No hay colores sugeridos registrados para tu avatar todavía.
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#2499c7]">
                Colores a evitar
              </p>
              <h3 className="text-2xl font-semibold text-[#0b2c3f]">Mantente alejada</h3>
            </div>
            <AlertTriangle className="h-5 w-5 text-[#006691]" />
          </div>
          <div className={`mt-4 ${GRID_CLASS}`}>
            {avoid.length > 0 ? (
              avoid.map((swatch, index) => renderSwatch(swatch, index))
            ) : (
              <div className={`${EMPTY_STATE_CLASS} col-span-full`}>
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
