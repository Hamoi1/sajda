import { useId, useMemo, useState, type ReactNode } from "react";
import { localDigits, regionName, t, type StringKey } from "../../lib/i18n";
import { cityToPlace, searchCities } from "../../lib/location";
import type { Lang, SoundMode } from "../../lib/types";
import { useSettingsStore } from "../../store/useSettingsStore";
import { IconCheck, IconSearch } from "../Icons";

const LANGS: { id: Lang; label: string; note: string }[] = [
  { id: "ckb", label: "کوردی", note: "Kurdî · Sorani" },
  { id: "ar", label: "العربية", note: "Arabic" },
  { id: "en", label: "English", note: "English" },
];

const SOUNDS: { id: SoundMode; labelKey: StringKey; hintKey: StringKey }[] = [
  { id: "adhan", labelKey: "soundAdhan", hintKey: "obSoundAdhanHint" },
  { id: "chime", labelKey: "soundChime", hintKey: "obSoundChimeHint" },
  { id: "silent", labelKey: "soundSilent", hintKey: "obSoundSilentHint" },
];

/** First run: language, city, how the adhan sounds. Every choice saves as it is made. */
export function Onboarding() {
  const lang = useSettingsStore((s) => s.lang);
  const update = useSettingsStore((s) => s.update);
  const [step, setStep] = useState(1);

  return (
    <div key={step} className="view-enter flex min-h-0 flex-col overflow-y-auto px-[72px] pt-12 pb-9">
      <p className="text-sm text-ink-muted">{t(lang, "obStep", { n: lang === "en" ? step : localDigits(lang, step) })}</p>
      {step === 1 && <LanguageStep />}
      {step === 2 && <CityStep />}
      {step === 3 && <SoundStep />}

      <div className="mt-auto flex items-center justify-between pt-8">
        <div className="flex gap-2.5">
          {step < 3 ? (
            <button type="button" className="btn-gold" onClick={() => setStep(step + 1)}>
              {t(lang, "obNext")}
            </button>
          ) : (
            <button type="button" className="btn-gold" onClick={() => update({ onboarded: true })}>
              {t(lang, "obStart")}
            </button>
          )}
          {step > 1 && (
            <button type="button" className="btn-ghost min-h-10" onClick={() => setStep(step - 1)}>
              {t(lang, "obBack")}
            </button>
          )}
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <span key={n} className={`h-1 w-[22px] rounded-sm ${n <= step ? "bg-gold" : "bg-line-strong"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Heading({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <>
      <h1 className="mt-2.5 text-[2.1rem] leading-tight font-extrabold">{children}</h1>
      {hint && <p className="mt-2 max-w-[520px] text-base leading-relaxed text-ink-soft">{hint}</p>}
    </>
  );
}

/** A large selectable card; the chosen one carries a gold edge. */
function OptionCard({
  selected,
  onSelect,
  title,
  note,
  dir,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  note: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      dir={dir}
      className={`flex h-[120px] flex-1 flex-col justify-between rounded-[14px] border bg-raised p-[18px] text-start transition-colors ${
        selected ? "border-gold shadow-[inset_0_0_0_1px_var(--gold)]" : "border-line-strong hover:border-ink-muted"
      }`}
    >
      <span className="text-[0.8rem] text-ink-soft">{note}</span>
      <span className="text-2xl font-bold">{title}</span>
    </button>
  );
}

function LanguageStep() {
  const lang = useSettingsStore((s) => s.lang);
  const update = useSettingsStore((s) => s.update);
  return (
    <>
      <Heading hint={t(lang, "obWelcomeHint")}>{t(lang, "obWelcome")}</Heading>
      <div role="radiogroup" aria-label={t(lang, "obWelcome")} className="mt-9 flex gap-3.5">
        {LANGS.map((l) => (
          <OptionCard
            key={l.id}
            selected={lang === l.id}
            onSelect={() => update({ lang: l.id })}
            title={l.label}
            note={l.note}
            dir={l.id === "en" ? "ltr" : "rtl"}
          />
        ))}
      </div>
    </>
  );
}

function CityStep() {
  const lang = useSettingsStore((s) => s.lang);
  const place = useSettingsStore((s) => s.place);
  const update = useSettingsStore((s) => s.update);
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchCities(query).slice(0, 6), [query]);
  const searchId = useId();

  return (
    <>
      <Heading>{t(lang, "obCity")}</Heading>
      <div className="relative mt-7">
        <label htmlFor={searchId} className="sr-only">
          {t(lang, "searchCity")}
        </label>
        <span className="pointer-events-none absolute inset-y-0 start-3 grid place-items-center text-ink-soft">
          <IconSearch />
        </span>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(lang, "searchCity")}
          className="h-12 w-full ps-10 text-[0.95rem]"
        />
      </div>
      <ul className="mt-3 overflow-hidden rounded-xl border border-line">
        {results.length === 0 && <li className="p-4 text-sm text-ink-soft">{t(lang, "noCity", { q: query })}</li>}
        {results.map((city) => {
          const selected = place.id === city.id;
          return (
            <li key={city.id} className="border-b border-line last:border-b-0">
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => update({ place: cityToPlace(city) })}
                className={`flex w-full items-center justify-between px-4 py-3 text-start text-[0.95rem] transition-colors hover:bg-tile-2 ${
                  selected ? "bg-[color-mix(in_oklab,var(--gold)_14%,transparent)] font-bold text-accent" : ""
                }`}
              >
                <span>{city[lang]}</span>
                <span className="flex items-center gap-2 text-sm font-normal text-ink-muted">
                  {regionName(lang, city.region)}
                  {selected && <IconCheck width={16} height={16} className="text-accent" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function SoundStep() {
  const lang = useSettingsStore((s) => s.lang);
  const sound = useSettingsStore((s) => s.sound);
  const widgetVisible = useSettingsStore((s) => s.widget.visible);
  const update = useSettingsStore((s) => s.update);
  const updateWidget = useSettingsStore((s) => s.updateWidget);

  return (
    <>
      <Heading>{t(lang, "obSound")}</Heading>
      <div role="radiogroup" aria-label={t(lang, "obSound")} className="mt-9 flex gap-3.5">
        {SOUNDS.map((s) => (
          <OptionCard
            key={s.id}
            selected={sound === s.id}
            onSelect={() => update({ sound: s.id })}
            title={t(lang, s.labelKey)}
            note={t(lang, s.hintKey)}
          />
        ))}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={widgetVisible}
        onClick={() => updateWidget({ visible: !widgetVisible })}
        className="mt-6 flex items-center justify-between gap-4 py-2 text-start"
      >
        <span>
          <span className="block text-[0.95rem]">{t(lang, "obWidget")}</span>
          <span className="block text-sm text-ink-muted">{t(lang, "obWidgetHint")}</span>
        </span>
        <span className={`relative h-6 w-[44px] shrink-0 rounded-full transition-colors ${widgetVisible ? "bg-gold" : "bg-raised-2"}`}>
          <span
            className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-surface transition-[inset-inline-start] duration-200 ${
              widgetVisible ? "start-[23px]" : "start-[3px]"
            }`}
          />
        </span>
      </button>
    </>
  );
}
