import { disable as disableAutostart, enable as enableAutostart, isEnabled as autostartEnabled } from "@tauri-apps/plugin-autostart";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { adhanAvailable, onPlayingChange, playSound, stopSound } from "../../lib/audio";
import { METHOD_LABELS, placeName, prayerName, regionName, t } from "../../lib/i18n";
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
import { METHOD_KEYS, PRAYER_KEYS, type Lang, type MethodKey } from "../../lib/types";
import { useSettingsStore } from "../../store/useSettingsStore";
import { IconCheck, IconClose, IconPlay, IconSearch, IconStop } from "../Icons";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const lang = useSettingsStore((s) => s.lang);

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
      className="m-auto h-[min(560px,92vh)] w-[min(680px,94vw)] overflow-hidden rounded-md border border-line bg-wool p-0 text-ink shadow-2xl"
    >
      {/* Only rendered while open, so each opening starts from fresh store values. */}
      {open && (
        <div className="flex h-full flex-col">
          <div className="flex items-center border-b border-line ps-5">
            <h2 id="settings-title" className="flex-1 text-lg font-bold">
              {t(lang, "settings")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t(lang, "close")}
              title={t(lang, "close")}
              className="grid h-11 w-11 place-items-center hover:bg-wool-2"
            >
              <IconClose />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-6 select-text">
            <LocationSection />
            <CalculationSection />
            <SoundSection />
            <DisplaySection />
            <WidgetSection />
            <SystemSection />
          </div>
        </div>
      )}
    </dialog>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-line py-5 last:border-b-0">
      <h3 className="mb-3 text-base font-bold text-madder">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="grid items-center gap-x-4 gap-y-1 min-[560px]:grid-cols-[200px_1fr]">
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
    <div role="radiogroup" className="inline-flex flex-wrap overflow-hidden rounded border border-line">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`cursor-pointer px-3 py-1.5 text-sm not-last:border-e not-last:border-line has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-indigo ${
            value === opt.value ? "bg-indigo text-wool" : "hover:bg-wool-2"
          }`}
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
    <Section title={t(lang, "location")}>
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
      <div className="max-h-52 overflow-y-auto rounded border border-line">
        {nothing ? (
          <p className="p-3 text-sm text-ink-soft">{t(lang, "noCity", { q: query })}</p>
        ) : (
          REGIONS.map((region) => {
            const cities = results.filter((c) => c.region === region);
            if (cities.length === 0) return null;
            return (
              <div key={region}>
                <p className="sticky top-0 bg-wool-2 px-3 py-1 text-xs font-semibold text-ink-soft">
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
                          className={`flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-wool-2 ${
                            selected ? "font-bold text-madder" : ""
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
          <p role="alert" className="px-3 py-2 text-xs text-madder">
            {t(lang, "worldError")}
          </p>
        )}
        {world.cities.length > 0 && (
          <div>
            <p className="sticky top-0 bg-wool-2 px-3 py-1 text-xs font-semibold text-ink-soft">{t(lang, "moreCities")}</p>
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
                      className={`flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-wool-2 ${
                        selected ? "font-bold text-madder" : ""
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
    </Section>
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
    <details open={isCustom} className="rounded border border-line">
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
          <p id={ids.err} role="alert" className="text-sm font-semibold text-madder">
            {error}
          </p>
        )}
        <div>
          <button type="submit" className="rounded bg-indigo px-4 py-2 text-sm font-semibold text-wool hover:opacity-90">
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
    <Section title={t(lang, "calculation")}>
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
              <div key={key} className="flex items-center justify-between rounded border border-line px-2 py-1">
                <span className="text-sm">{name}</span>
                <div className="flex items-center" dir="ltr">
                  <button
                    type="button"
                    onClick={() => setOffset(key, value - 1)}
                    disabled={value <= -30}
                    aria-label={`${name} −1 ${t(lang, "minutesShort")}`}
                    className="grid h-9 w-9 place-items-center rounded hover:bg-wool-2 disabled:opacity-40"
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
                    className="grid h-9 w-9 place-items-center rounded hover:bg-wool-2 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

function SoundSection() {
  const lang = useSettingsStore((s) => s.lang);
  const sound = useSettingsStore((s) => s.sound);
  const volume = useSettingsStore((s) => s.volume);
  const reminderMin = useSettingsStore((s) => s.reminderMin);
  const update = useSettingsStore((s) => s.update);
  const [hasAdhan, setHasAdhan] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const volumeId = useId();
  const reminderId = useId();

  useEffect(() => {
    void adhanAvailable().then(setHasAdhan);
    return onPlayingChange(setPlaying);
  }, []);

  return (
    <Section title={t(lang, "sound")}>
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
            onClick={() => (playing ? stopSound() : void playSound(sound === "silent" ? "chime" : sound, volume))}
            className="flex h-9 items-center gap-1.5 rounded border border-line px-3 text-sm hover:bg-wool-2"
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
    </Section>
  );
}

function DisplaySection() {
  const lang = useSettingsStore((s) => s.lang);
  const theme = useSettingsStore((s) => s.theme);
  const clock = useSettingsStore((s) => s.clock);
  const update = useSettingsStore((s) => s.update);

  return (
    <Section title={t(lang, "display")}>
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
    </Section>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}

function WidgetSection() {
  const lang = useSettingsStore((s) => s.lang);
  const widget = useSettingsStore((s) => s.widget);
  const updateWidget = useSettingsStore((s) => s.updateWidget);
  const opacityId = useId();

  return (
    <Section title={t(lang, "widget")}>
      <Toggle label={t(lang, "widgetVisible")} checked={widget.visible} onChange={(visible) => updateWidget({ visible })} />
      <Toggle
        label={t(lang, "alwaysOnTop")}
        checked={widget.alwaysOnTop}
        onChange={(alwaysOnTop) => updateWidget({ alwaysOnTop })}
      />
      <Toggle label={t(lang, "lockPosition")} checked={widget.locked} onChange={(locked) => updateWidget({ locked })} />
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
    </Section>
  );
}

function SystemSection() {
  const lang = useSettingsStore((s) => s.lang);
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
    <Section title={t(lang, "system")}>
      {inTauri ? (
        <Toggle label={t(lang, "autostart")} checked={enabled ?? false} onChange={(on) => void change(on)} />
      ) : (
        <p className="text-sm text-ink-soft">
          {t(lang, "autostart")}: {t(lang, "desktopOnly")}
        </p>
      )}
      {failed && (
        <p role="alert" className="text-sm font-semibold text-madder">
          {t(lang, "autostartFailed")}
        </p>
      )}
    </Section>
  );
}
