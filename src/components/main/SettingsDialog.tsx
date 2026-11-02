import { disable as disableAutostart, enable as enableAutostart, isEnabled as autostartEnabled } from "@tauri-apps/plugin-autostart";
import { useEffect, useId, useMemo, useRef, useState, type ComponentType, type FormEvent, type ReactNode, type SVGProps } from "react";
import { ADHAN_VOICES, adhanAvailable, onPlayingChange, playSound, stopSound } from "../../lib/audio";
import { METHOD_LABELS, placeName, prayerName, regionName, t, type StringKey } from "../../lib/i18n";
import {
  allTimeZones,
  cityToPlace,
  isValidCoords,
  searchCities,
  searchWorld,
  systemTimeZone,
  worldCityToPlace,
  type Region,
  type WorldCity,
} from "../../lib/location";
import { inTauri } from "../../lib/tauri";
import {
  METHOD_KEYS,
  PRAYER_KEYS,
  WIDGET_SIZE_KEYS,
  WIDGET_THEME_KEYS,
  type Lang,
  type MethodKey,
  type WidgetSize,
  type WidgetTheme,
} from "../../lib/types";
import { WIDGET_SIZES } from "../../lib/widgetThemes";
import { useSettingsStore } from "../../store/useSettingsStore";
import { IconBook, IconCheck, IconClose, IconCog, IconPlace, IconPlay, IconSearch, IconStop, IconVolume, IconWidget } from "../Icons";
import { WidgetCard } from "../widget/WidgetCard";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

type SettingsPage = "times" | "sound" | "widget" | "reader" | "general";

const PAGES: { id: SettingsPage; labelKey: StringKey; hintKey?: StringKey; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { id: "times", labelKey: "settingsTimes", hintKey: "settingsTimesHint", icon: IconPlace },
  { id: "sound", labelKey: "sound", hintKey: "soundHint", icon: IconVolume },
  { id: "widget", labelKey: "widget", hintKey: "widgetHint", icon: IconWidget },
  { id: "reader", labelKey: "quranLock", hintKey: "quranLockHint", icon: IconBook },
  { id: "general", labelKey: "settingsGeneral", hintKey: "settingsGeneralHint", icon: IconCog },
];

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const lang = useSettingsStore((s) => s.lang);
  const [page, setPage] = useState<SettingsPage>("times");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="settings-title"
      className="m-auto h-[min(640px,92vh)] w-[min(880px,96vw)] overflow-hidden rounded-xl border border-line bg-surface p-0 text-ink shadow-2xl"
    >
      {/* Rendered while open; the page state survives reopening so the user lands where they were. */}
      {open && (
        <div className="flex h-full flex-col md:flex-row">
          <nav className="flex shrink-0 gap-1 border-b border-line bg-veil p-2 md:w-[220px] md:flex-col md:border-b-0 md:border-e md:p-3" aria-label={t(lang, "settings")}>
            <h2 id="settings-title" className="hidden px-3 pb-2 pt-1 text-[1.15rem] font-bold text-accent md:block">
              {t(lang, "settings")}
            </h2>
            {PAGES.map(({ id, labelKey, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-current={page === id ? "page" : undefined}
                onClick={() => setPage(id)}
                className={`mx-1 flex items-center gap-3 rounded-[10px] px-4 py-[9px] text-start text-sm transition-all ${
                  page === id ? "font-bold text-on-gold" : "text-ink-soft hover:bg-tile hover:text-ink"
                }`}
                style={
                  page === id
                    ? { background: "var(--accent-gradient)", boxShadow: "var(--accent-glow)" }
                    : undefined
                }
              >
                <Icon width={16} height={16} className={page === id ? "" : "opacity-80"} />
                {t(lang, labelKey)}
              </button>
            ))}
          </nav>

          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-line px-5 py-2.5 md:hidden">
              <h2 className="text-lg font-bold">{t(lang, "settings")}</h2>
              <button type="button" onClick={onClose} aria-label={t(lang, "close")} className="grid h-9 w-9 place-items-center rounded hover:bg-surface-2">
                <IconClose />
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t(lang, "close")}
              className="absolute end-2 top-2 z-10 hidden h-9 w-9 place-items-center rounded-lg hover:bg-surface-2 md:grid"
            >
              <IconClose />
            </button>
            <div key={page} className="view-enter min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-5 select-text">
              {page === "times" && (
                <Page title={t(lang, "settingsTimes")} hint={t(lang, "settingsTimesHint")}>
                  <LocationSection />
                  <CalculationSection />
                </Page>
              )}
              {page === "sound" && (
                <Page title={t(lang, "sound")} hint={t(lang, "soundHint")}>
                  <SoundSection />
                </Page>
              )}
              {page === "widget" && (
                <Page title={t(lang, "widget")} hint={t(lang, "widgetHint")}>
                  <WidgetSection />
                </Page>
              )}
              {page === "reader" && (
                <Page title={t(lang, "quranLock")} hint={t(lang, "quranLockHint")}>
                  <ReaderSection />
                </Page>
              )}
              {page === "general" && (
                <Page title={t(lang, "settingsGeneral")} hint={t(lang, "settingsGeneralHint")}>
                  <DisplaySection />
                  <SystemSection />
                </Page>
              )}
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

function Page({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5">
      <div>
        <h3 className="text-lg font-bold text-accent">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

/** A titled sub-block inside a page. */
function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-line pt-4 first:border-t-0 first:pt-0">
      <h4 className="text-sm font-bold text-ink-soft">{title}</h4>
      {children}
    </section>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="grid items-center gap-x-4 gap-y-1 min-[620px]:grid-cols-[200px_1fr]">
      <label htmlFor={htmlFor} className="text-sm text-ink-soft">
        {label}
      </label>
      <div>{children}</div>
    </div>
  );
}

function Choice<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" className="inline-flex max-w-full flex-wrap gap-[3px] rounded-[10px] border border-line bg-tile p-[3px]">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-sm transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold ${
            value === opt.value ? "font-bold text-on-gold" : "hover:text-ink"
          }`}
          style={value === opt.value ? { background: "var(--accent-gradient)" } : undefined}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="sr-only"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

/** A switch row: label on one side, iOS-style gold switch on the other. */
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-4 rounded-xl border border-line bg-tile px-4 py-3 text-start text-sm transition-colors hover:border-gold/50"
    >
      <span>{label}</span>
      <span
        className={`relative h-6 w-[46px] shrink-0 rounded-full transition-colors duration-200 ${checked ? "" : "bg-line"}`}
        style={checked ? { background: "var(--accent-gradient)", boxShadow: "var(--accent-glow)" } : undefined}
      >
        <span
          className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-surface shadow transition-[inset-inline-start] duration-200 ${
            checked ? "start-[25px]" : "start-[3px]"
          }`}
        />
      </span>
    </button>
  );
}

const REGIONS: Region[] = ["kurdistan", "iraq", "world"];

function LocationSection() {
  const lang = useSettingsStore((s) => s.lang);
  const place = useSettingsStore((s) => s.place);
  const update = useSettingsStore((s) => s.update);
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchCities(query), [query]);
  const world = useWorldSearch(query);
  const searchId = useId();
  const nothing = results.length === 0 && world.status === "done" && world.cities.length === 0;

  return (
    <Group title={t(lang, "location")}>
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          {t(lang, "searchCity")}
        </label>
        <span className="pointer-events-none absolute inset-y-0 start-2 grid place-items-center text-ink-soft">
          <IconSearch />
        </span>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(lang, "searchCity")}
          className="w-full ps-9"
        />
      </div>
      <div className="max-h-52 overflow-y-auto rounded-md border border-line">
        {nothing ? (
          <p className="p-3 text-sm text-ink-soft">{t(lang, "noCity", { q: query })}</p>
        ) : (
          REGIONS.map((region) => {
            const cities = results.filter((c) => c.region === region);
            if (cities.length === 0) return null;
            return (
              <div key={region}>
                <p className="sticky top-0 bg-surface-2 px-3 py-1 text-xs font-semibold text-ink-soft">
                  {regionName(lang, region)}
                </p>
                <ul>
                  {cities.map((city) => {
                    const selected = place.id === city.id;
                    return (
                      <li key={city.id}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => update({ place: cityToPlace(city) })}
                          className={`flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-surface-2 ${
                            selected ? "font-bold text-accent" : ""
                          }`}
                        >
                          <span>{lang === "en" ? city.en : `${city[lang]} · ${city.en}`}</span>
                          {selected && <IconCheck />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
        {world.status === "loading" && (
          <p role="status" className="px-3 py-2 text-xs text-ink-soft">
            {t(lang, "searchingWorld")}
          </p>
        )}
        {world.status === "error" && (
          <p role="alert" className="px-3 py-2 text-xs text-accent">
            {t(lang, "worldError")}
          </p>
        )}
        {world.cities.length > 0 && (
          <div>
            <p className="sticky top-0 bg-surface-2 px-3 py-1 text-xs font-semibold text-ink-soft">{t(lang, "moreCities")}</p>
            <ul>
              {world.cities.map((city) => {
                const next = worldCityToPlace(city);
                const selected = place.id === next.id;
                return (
                  <li key={next.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => update({ place: next })}
                      className={`flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-surface-2 ${
                        selected ? "font-bold text-accent" : ""
                      }`}
                    >
                      <span dir="ltr">
                        {city.name}
                        <span className="text-ink-soft">
                          {city.province ? `, ${city.province}` : ""}, {city.country}
                        </span>
                      </span>
                      {selected && <IconCheck />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <CustomPlaceForm lang={lang} />
    </Group>
  );
}

type WorldSearch = { status: "idle" | "loading" | "done" | "error"; cities: WorldCity[] };

function useWorldSearch(query: string): WorldSearch {
  const [state, setState] = useState<WorldSearch>({ status: "idle", cities: [] });
  useEffect(() => {
    if (query.trim().length < 2) {
      setState({ status: "idle", cities: [] });
      return;
    }
    let cancelled = false;
    setState((s) => ({ status: "loading", cities: s.cities }));
    const timer = window.setTimeout(() => {
      searchWorld(query)
        .then((cities) => !cancelled && setState({ status: "done", cities }))
        .catch((err) => {
          console.error("world city search failed", err);
          if (!cancelled) setState({ status: "error", cities: [] });
        });
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);
  return state;
}

function CustomPlaceForm({ lang }: { lang: Lang }) {
  const place = useSettingsStore((s) => s.place);
  const update = useSettingsStore((s) => s.update);
  const isCustom = place.id === "custom";
  const [name, setName] = useState(isCustom ? place.names.en : "");
  const [lat, setLat] = useState(isCustom ? String(place.lat) : "");
  const [lng, setLng] = useState(isCustom ? String(place.lng) : "");
  const [tz, setTz] = useState(isCustom ? place.tz : systemTimeZone());
  const [error, setError] = useState("");
  const zones = useMemo(allTimeZones, []);
  const ids = { name: useId(), lat: useId(), lng: useId(), tz: useId(), err: useId() };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const la = Number(lat);
    const lo = Number(lng);
    if (lat.trim() === "" || lng.trim() === "" || !isValidCoords(la, lo)) {
      setError(t(lang, "coordsInvalid"));
      return;
    }
    setError("");
    const label = name.trim() || `${la.toFixed(3)}, ${lo.toFixed(3)}`;
    update({ place: { id: "custom", names: { en: label, ckb: label, ar: label }, lat: la, lng: lo, tz } });
  };

  return (
    <details open={isCustom} className="rounded-md border border-line">
      <summary className="cursor-pointer px-3 py-2 text-sm font-semibold">
        {t(lang, "customPlace")}
        {isCustom && <span className="ms-2 font-normal text-ink-soft">· {placeName(lang, place)}</span>}
      </summary>
      <form onSubmit={submit} noValidate className="flex flex-col gap-3 border-t border-line p-3">
        <Field label={t(lang, "placeName")} htmlFor={ids.name}>
          <input id={ids.name} type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
        </Field>
        <Field label={t(lang, "latitude")} htmlFor={ids.lat}>
          <input
            id={ids.lat}
            type="number"
            step="any"
            dir="ltr"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="35.5613"
            aria-invalid={!!error}
            aria-describedby={error ? ids.err : undefined}
            className="w-full"
          />
        </Field>
        <Field label={t(lang, "longitude")} htmlFor={ids.lng}>
          <input
            id={ids.lng}
            type="number"
            step="any"
            dir="ltr"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="45.4373"
            aria-invalid={!!error}
            aria-describedby={error ? ids.err : undefined}
            className="w-full"
          />
        </Field>
        <Field label={t(lang, "timezone")} htmlFor={ids.tz}>
          <select id={ids.tz} value={tz} onChange={(e) => setTz(e.target.value)} dir="ltr" className="w-full">
            {zones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </Field>
        {error && (
          <p id={ids.err} role="alert" className="text-sm font-semibold text-accent">
            {error}
          </p>
        )}
        <div>
          <button type="submit" className="rounded-md bg-indigo px-4 py-2 text-sm font-semibold text-on-indigo hover:opacity-90">
            {t(lang, "useCustom")}
          </button>
        </div>
      </form>
    </details>
  );
}

function CalculationSection() {
  const lang = useSettingsStore((s) => s.lang);
  const method = useSettingsStore((s) => s.method);
  const madhab = useSettingsStore((s) => s.madhab);
  const offsets = useSettingsStore((s) => s.offsets);
  const update = useSettingsStore((s) => s.update);
  const setOffset = useSettingsStore((s) => s.setOffset);
  const methodId = useId();

  return (
    <Group title={t(lang, "calculation")}>
      <Field label={t(lang, "method")} htmlFor={methodId}>
        <select
          id={methodId}
          value={method}
          onChange={(e) => update({ method: e.target.value as MethodKey })}
          className="w-full"
        >
          {METHOD_KEYS.map((key) => (
            <option key={key} value={key}>
              {METHOD_LABELS[key][lang]}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t(lang, "madhab")}>
        <Choice
          name="madhab"
          value={madhab}
          onChange={(v) => update({ madhab: v })}
          options={[
            { value: "shafi", label: t(lang, "shafi") },
            { value: "hanafi", label: t(lang, "hanafi") },
          ]}
        />
      </Field>
      <div>
        <p className="text-sm text-ink-soft">{t(lang, "offsets")}</p>
        <p className="mb-2 text-xs text-ink-soft">{t(lang, "offsetsHint")}</p>
        <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-3">
          {PRAYER_KEYS.map((key) => {
            const name = prayerName(lang, key);
            const value = offsets[key];
            return (
              <div key={key} className="flex items-center justify-between rounded-md border border-line px-2 py-1">
                <span className="text-sm">{name}</span>
                <div className="flex items-center" dir="ltr">
                  <button
                    type="button"
                    onClick={() => setOffset(key, value - 1)}
                    disabled={value <= -30}
                    aria-label={`${name} −1 ${t(lang, "minutesShort")}`}
                    className="grid h-9 w-9 place-items-center rounded hover:bg-surface-2 disabled:opacity-40"
                  >
                    −
                  </button>
                  <output className="tabular w-10 text-center text-sm font-semibold" aria-live="polite">
                    {value > 0 ? `+${value}` : value}
                  </output>
                  <button
                    type="button"
                    onClick={() => setOffset(key, value + 1)}
                    disabled={value >= 30}
                    aria-label={`${name} +1 ${t(lang, "minutesShort")}`}
                    className="grid h-9 w-9 place-items-center rounded hover:bg-surface-2 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Group>
  );
}

function SoundSection() {
  const lang = useSettingsStore((s) => s.lang);
  const sound = useSettingsStore((s) => s.sound);
  const volume = useSettingsStore((s) => s.volume);
  const adhanFile = useSettingsStore((s) => s.adhanFile);
  const reminderMin = useSettingsStore((s) => s.reminderMin);
  const update = useSettingsStore((s) => s.update);
  const [hasAdhan, setHasAdhan] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const volumeId = useId();
  const reminderId = useId();
  const voiceId = useId();

  useEffect(() => {
    void adhanAvailable(adhanFile).then(setHasAdhan);
    return onPlayingChange(setPlaying);
  }, [adhanFile]);

  return (
    <Group title={t(lang, "sound")}>
      <Field label={t(lang, "sound")}>
        <Choice
          name="sound"
          value={sound}
          onChange={(v) => update({ sound: v })}
          options={[
            { value: "adhan", label: t(lang, "soundAdhan") },
            { value: "chime", label: t(lang, "soundChime") },
            { value: "silent", label: t(lang, "soundSilent") },
          ]}
        />
        {sound === "adhan" && hasAdhan === false && (
          <p className="mt-2 text-xs text-ink-soft" dir="auto">
            {t(lang, "adhanMissing")}
          </p>
        )}
      </Field>
      {sound !== "silent" && (
        <Field label={t(lang, "adhanVoice")} htmlFor={voiceId}>
          <select
            id={voiceId}
            value={adhanFile}
            onChange={(e) => update({ adhanFile: e.target.value })}
          >
            {ADHAN_VOICES.map((voice) => (
              <option key={voice.file} value={voice.file}>
                {voice.label[lang]}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label={`${t(lang, "volume")} · ${volume}%`} htmlFor={volumeId}>
        <div className="flex items-center gap-3">
          <input
            id={volumeId}
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => update({ volume: Number(e.target.value) })}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => (playing ? stopSound() : void playSound(sound === "silent" ? "chime" : sound, volume, adhanFile))}
            className="flex h-9 items-center gap-1.5 rounded-md border border-line px-3 text-sm hover:bg-surface-2"
          >
            {playing ? <IconStop /> : <IconPlay />}
            {playing ? t(lang, "stop") : t(lang, "test")}
          </button>
        </div>
      </Field>
      <Field label={t(lang, "reminder")} htmlFor={reminderId}>
        <select
          id={reminderId}
          value={reminderMin}
          onChange={(e) => update({ reminderMin: Number(e.target.value) })}
        >
          {[0, 5, 10, 15, 20, 30].map((n) => (
            <option key={n} value={n}>
              {n === 0 ? t(lang, "reminderOff") : t(lang, "reminderN", { n })}
            </option>
          ))}
        </select>
      </Field>
    </Group>
  );
}

function DisplaySection() {
  const lang = useSettingsStore((s) => s.lang);
  const theme = useSettingsStore((s) => s.theme);
  const clock = useSettingsStore((s) => s.clock);
  const update = useSettingsStore((s) => s.update);

  return (
    <Group title={t(lang, "display")}>
      <Field label={t(lang, "language")}>
        <Choice
          name="lang"
          value={lang}
          onChange={(v) => update({ lang: v })}
          options={[
            { value: "ckb", label: "کوردی" },
            { value: "ar", label: "العربية" },
            { value: "en", label: "English" },
          ]}
        />
      </Field>
      <Field label={t(lang, "theme")}>
        <Choice
          name="theme"
          value={theme}
          onChange={(v) => update({ theme: v })}
          options={[
            { value: "system", label: t(lang, "themeSystem") },
            { value: "light", label: t(lang, "themeLight") },
            { value: "dark", label: t(lang, "themeDark") },
          ]}
        />
      </Field>
      <Field label={t(lang, "clock")}>
        <Choice
          name="clock"
          value={clock}
          onChange={(v) => update({ clock: v })}
          options={[
            { value: "12", label: t(lang, "clock12") },
            { value: "24", label: t(lang, "clock24") },
          ]}
        />
      </Field>
    </Group>
  );
}

/** Renders the real widget card at the given size, scaled to fit the preview box. */
function WidgetPreview({ size, scale }: { size: WidgetSize; scale: number }) {
  const { width, height } = WIDGET_SIZES[size];
  return (
    <div style={{ width: width * scale, height: height * scale }} className="shrink-0">
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <LiveWidgetCard size={size} />
      </div>
    </div>
  );
}

function LiveWidgetCard({ size }: { size: WidgetSize }) {
  const widget = useSettingsStore((s) => s.widget);
  const updateWidget = useSettingsStore((s) => s.updateWidget);
  const [playing, setPlaying] = useState(false);

  useEffect(() => onPlayingChange(setPlaying), []);

  return (
    <WidgetCard
      size={size}
      theme={widget.theme}
      opacity={Math.max(widget.opacity, 70)}
      locked={widget.locked}
      playing={playing}
      onToggleLock={() => updateWidget({ locked: !widget.locked })}
      onStopSound={() => stopSound()}
    />
  );
}

const THEME_LABEL_KEYS: Record<WidgetTheme, "wThemeIndigoGold" | "wThemeGlass" | "wThemeClassic" | "wThemeKilim" | "wThemeMinimal" | "wThemeMidnight"> = {
  indigoGold: "wThemeIndigoGold",
  glass: "wThemeGlass",
  classic: "wThemeClassic",
  kilim: "wThemeKilim",
  minimal: "wThemeMinimal",
  midnight: "wThemeMidnight",
};

const SIZE_LABEL_KEYS: Record<WidgetSize, "widgetSizeSmall" | "widgetSizeStandard" | "widgetSizeLarge" | "widgetSizeHuge"> = {
  small: "widgetSizeSmall",
  standard: "widgetSizeStandard",
  large: "widgetSizeLarge",
  huge: "widgetSizeHuge",
};

function WidgetSection() {
  const lang = useSettingsStore((s) => s.lang);
  const widget = useSettingsStore((s) => s.widget);
  const updateWidget = useSettingsStore((s) => s.updateWidget);
  const opacityId = useId();
  const previewScale = widget.size === "huge" ? 0.78 : widget.size === "large" ? 0.92 : 1;

  return (
    <Group title={t(lang, "widget")}>
      <div className="flex justify-center rounded-xl border border-line bg-veil p-4">
        <WidgetPreview size={widget.size} scale={previewScale} />
      </div>

      <div>
        <p className="mb-2 text-sm text-ink-soft">{t(lang, "widgetTheme")}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {WIDGET_THEME_KEYS.map((theme) => {
            const selected = widget.theme === theme;
            return (
              <button
                key={theme}
                type="button"
                aria-pressed={selected}
                onClick={() => updateWidget({ theme })}
                className={`rounded-lg p-1.5 text-center transition-shadow ${
                  selected ? "ring-2 ring-gold" : "ring-1 ring-line hover:ring-ink-soft"
                }`}
              >
                <div className="pointer-events-none h-[52px] w-[132px] overflow-hidden rounded-md mx-auto">
                  <div className="h-[116px] w-[300px] origin-top-left" style={{ transform: "scale(0.44)" }}>
                    <WidgetCard size="standard" theme={theme} opacity={100} locked buttons={false} />
                  </div>
                </div>
                <span className={`mt-1 block truncate text-xs ${selected ? "font-bold text-accent" : "text-ink-soft"}`}>
                  {t(lang, THEME_LABEL_KEYS[theme])}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Field label={t(lang, "widgetSize")}>
        <Choice
          name="widget-size"
          value={widget.size}
          onChange={(v) => updateWidget({ size: v })}
          // \u2066..\u2069 keep the WxH dimensions reading left-to-right inside RTL labels.
          options={WIDGET_SIZE_KEYS.map((s) => ({
            value: s,
            label: `${t(lang, SIZE_LABEL_KEYS[s])} · \u2066${WIDGET_SIZES[s].width}×${WIDGET_SIZES[s].height}\u2069`,
          }))}
        />
      </Field>

      <Field label={`${t(lang, "opacity")} · ${widget.opacity}%`} htmlFor={opacityId}>
        <input
          id={opacityId}
          type="range"
          min={20}
          max={100}
          value={widget.opacity}
          onChange={(e) => updateWidget({ opacity: Number(e.target.value) })}
          className="w-full"
        />
      </Field>

      <Toggle label={t(lang, "widgetVisible")} checked={widget.visible} onChange={(visible) => updateWidget({ visible })} />
      <Toggle
        label={t(lang, "alwaysOnTop")}
        checked={widget.alwaysOnTop}
        onChange={(alwaysOnTop) => updateWidget({ alwaysOnTop })}
      />
      <Toggle label={t(lang, "lockPosition")} checked={widget.locked} onChange={(locked) => updateWidget({ locked })} />
    </Group>
  );
}

/** "21:00, 05:30" → ["21:00","05:30"]; null when any entry is malformed. */
function parseTimes(raw: string): string[] | null {
  const entries = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
  const out: string[] = [];
  for (const entry of entries) {
    const m = entry.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h > 23 || min > 59) return null;
    out.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return out;
}

function ReaderSection() {
  const lang = useSettingsStore((s) => s.lang);
  const reader = useSettingsStore((s) => s.reader);
  const updateReader = useSettingsStore((s) => s.updateReader);
  const [timesRaw, setTimesRaw] = useState(reader.times.join(", "));
  const [timesError, setTimesError] = useState(false);
  const [poolRaw, setPoolRaw] = useState(reader.pool.join(", "));
  const [poolError, setPoolError] = useState(false);

  const onTimes = (raw: string) => {
    setTimesRaw(raw);
    if (raw.trim() === "") {
      setTimesError(false);
      updateReader({ times: [] });
      return;
    }
    const parsed = parseTimes(raw);
    setTimesError(parsed === null);
    if (parsed) updateReader({ times: parsed });
  };

  const onPool = (raw: string) => {
    setPoolRaw(raw);
    const nums = raw
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 114);
    const malformed = raw.trim() !== "" && raw.split(",").some((s) => s.trim() !== "" && !(Number.isInteger(Number(s.trim())) && Number(s.trim()) >= 1 && Number(s.trim()) <= 114));
    setPoolError(malformed);
    updateReader({ pool: nums });
  };

  const surahId = useId();
  const adhanId = useId();

  return (
    <Group title={t(lang, "quranLock")}>
      <Toggle label={t(lang, "quranLockEnable")} checked={reader.enabled} onChange={(enabled) => updateReader({ enabled })} />

      <Field label={t(lang, "quranLockAfterAdhan")} htmlFor={adhanId}>
        <select
          id={adhanId}
          value={reader.afterAdhanMin}
          onChange={(e) => updateReader({ afterAdhanMin: Number(e.target.value) })}
        >
          {[0, 5, 10, 15, 20, 30].map((n) => (
            <option key={n} value={n}>
              {n === 0 ? t(lang, "quranLockAfterAdhanOff") : t(lang, "reminderN", { n })}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t(lang, "quranLockTimes")}>
        <div>
          <input
            type="text"
            dir="ltr"
            value={timesRaw}
            onChange={(e) => onTimes(e.target.value)}
            placeholder="21:00, 05:30"
            aria-invalid={timesError}
            className="w-full max-w-xs"
          />
          <p className="mt-1 text-xs text-ink-soft">{t(lang, "quranLockTimesHint")}</p>
          {timesError && (
            <p role="alert" className="mt-1 text-xs font-semibold text-accent">
              {t(lang, "quranLockTimesInvalid")}
            </p>
          )}
        </div>
      </Field>

      <Field label={t(lang, "quranLockMode")}>
        <Choice
          name="reader-mode"
          value={reader.mode}
          onChange={(v) => updateReader({ mode: v })}
          options={[
            { value: "random", label: t(lang, "quranLockRandom") },
            { value: "fixed", label: t(lang, "quranLockFixed") },
          ]}
        />
      </Field>

      {reader.mode === "fixed" ? (
        <Field label={t(lang, "quranLockSurahN")} htmlFor={surahId}>
          <input
            id={surahId}
            type="number"
            dir="ltr"
            min={1}
            max={114}
            value={reader.surah}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isInteger(n) && n >= 1 && n <= 114) updateReader({ surah: n });
            }}
            className="w-24"
          />
        </Field>
      ) : (
        <Field label={t(lang, "quranLockPool")}>
          <div>
            <input
              type="text"
              dir="ltr"
              value={poolRaw}
              onChange={(e) => onPool(e.target.value)}
              placeholder="78, 82, 97, 112, 113, 114"
              aria-invalid={poolError}
              className="w-full max-w-xs"
            />
            <p className="mt-1 text-xs text-ink-soft">{t(lang, "quranLockPoolHint")}</p>
          </div>
        </Field>
      )}
    </Group>
  );
}

function SystemSection() {
  const lang = useSettingsStore((s) => s.lang);
  const updateCheck = useSettingsStore((s) => s.updateCheck);
  const update = useSettingsStore((s) => s.update);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!inTauri) return;
    autostartEnabled()
      .then(setEnabled)
      .catch(() => setFailed(true));
  }, []);

  const change = async (on: boolean) => {
    try {
      await (on ? enableAutostart() : disableAutostart());
      setEnabled(await autostartEnabled());
      setFailed(false);
    } catch (err) {
      console.error("autostart change failed", err);
      setFailed(true);
    }
  };

  return (
    <Group title={t(lang, "system")}>
      {inTauri ? (
        <Toggle label={t(lang, "autostart")} checked={enabled ?? false} onChange={(on) => void change(on)} />
      ) : (
        <p className="text-sm text-ink-soft">
          {t(lang, "autostart")}: {t(lang, "desktopOnly")}
        </p>
      )}
      {failed && (
        <p role="alert" className="text-sm font-semibold text-accent">
          {t(lang, "autostartFailed")}
        </p>
      )}

      <Toggle label={t(lang, "updatesEnable")} checked={updateCheck} onChange={(updateCheck) => update({ updateCheck })} />
      <p className="text-xs text-ink-soft">{t(lang, "updatesHint")}</p>
    </Group>
  );
}
