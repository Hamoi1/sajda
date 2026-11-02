import type { Lang, MethodKey, Place, PrayerKey } from "./types";

const ckb = {
  appName: "سەجدە",
  prayers: { fajr: "بەیانی", sunrise: "خۆرهەڵاتن", dhuhr: "نیوەڕۆ", asr: "عەسر", maghrib: "مەغریب", isha: "عیشا" },
  timeLeftUntil: "ماوە بۆ {p}",
  at: "کاتژمێر {t}",
  settings: "ڕێکخستنەکان",
  close: "داخستن",
  minimize: "بچووککردنەوە",
  hideToTray: "شاردنەوە بۆ تری",
  showWidget: "پیشاندانی ویجێت",
  hideWidget: "شاردنەوەی ویجێت",
  muteP: "دەنگی {p} بکوژێنەوە",
  unmuteP: "دەنگی {p} هەڵبکە",
  location: "شوێن",
  searchCity: "گەڕان بۆ شار",
  noCity: "هیچ شارێک بە «{q}» نییە. دەتوانیت پانی و درێژی خۆت لە خوارەوە بنووسیت.",
  regions: { kurdistan: "کوردستان", iraq: "عێراق", world: "جیهان" },
  moreCities: "شارەکانی تری جیهان",
  searchingWorld: "گەڕان لە شارەکانی جیهان…",
  worldError: "لیستی شارەکانی جیهان بار نەبوو. دووبارە بگەڕێ.",
  customPlace: "شوێنی تایبەت",
  placeName: "ناو",
  latitude: "پانی (Latitude)",
  longitude: "درێژی (Longitude)",
  timezone: "ناوچەی کات",
  useCustom: "بەکارهێنانی ئەم شوێنە",
  coordsInvalid: "پانی دەبێت لە نێوان ٩٠- و ٩٠ بێت، درێژی لە نێوان ١٨٠- و ١٨٠.",
  calculation: "هەژمارکردن",
  method: "شێوازی هەژمارکردن",
  madhab: "مەزهەب (بۆ کاتی عەسر)",
  shafi: "شافیعی (ستاندارد)",
  hanafi: "حەنەفی",
  offsets: "ڕێکخستنی خولەک بۆ هەر بانگێک",
  offsetsHint: "بۆ ئەوەی کاتەکان وەک تەوقیتی مزگەوتەکەت بن.",
  minutesShort: "خولەک",
  sound: "دەنگ",
  soundAdhan: "بانگی تەواو",
  soundChime: "زەنگی کورت",
  soundSilent: "بێدەنگ",
  volume: "بەرزی دەنگ",
  test: "تاقیکردنەوە",
  stop: "ڕاگرتن",
  adhanMissing: "فایلی بانگ دانەنراوە. فایلێکی mp3 لە public/audio/adhan.mp3 دابنێ؛ تا ئەو کاتە زەنگی کورت لێدەدرێت.",
  reminder: "ئاگادارکردنەوەی پێشوەختە",
  reminderOff: "کوژاوە",
  reminderN: "{n} خولەک پێشتر",
  display: "نمایش",
  language: "زمان",
  theme: "ڕووکار",
  themeSystem: "وەک سیستەم",
  themeLight: "ڕووناک",
  themeDark: "تاریک",
  clock: "کاتژمێر",
  clock12: "١٢ کاتژمێری",
  clock24: "٢٤ کاتژمێری",
  widget: "ویجێت",
  widgetVisible: "ویجێت پیشان بدە",
  alwaysOnTop: "هەمیشە لە سەرەوەی پەنجەرەکان",
  opacity: "ڕوونی باکگراوند",
  lockPosition: "چەسپاندنی شوێنی ویجێت",
  unlockPosition: "لابردنی چەسپاندن",
  system: "سیستەم",
  autostart: "کردنەوە لەگەڵ هەڵبوونی کۆمپیوتەر",
  autostartFailed: "نەتوانرا ڕێکخستنی کردنەوەی خۆکار بگۆڕدرێت. دووبارە هەوڵ بدەوە.",
  desktopOnly: "تەنها لە ئەپی دێسکتۆپدا کار دەکات.",
  notifTitle: "کاتی بانگی {p}",
  notifSunrise: "خۆرهەڵاتن",
  notifBody: "{city}",
  reminderTitle: "{n} خولەک ماوە بۆ {p}",
  calcError: "ناتوانرێت کاتەکان بۆ ئەم شوێنە هەژمار بکرێن. پانی و درێژییەکە بپشکنە یان شارێکی تر هەڵبژێرە.",
  changePlace: "گۆڕینی شوێن",
};

type Dict = typeof ckb;

const ar: Dict = {
  appName: "سجدة",
  prayers: { fajr: "الفجر", sunrise: "الشروق", dhuhr: "الظهر", asr: "العصر", maghrib: "المغرب", isha: "العشاء" },
  timeLeftUntil: "المتبقي حتى {p}",
  at: "الساعة {t}",
  settings: "الإعدادات",
  close: "إغلاق",
  minimize: "تصغير",
  hideToTray: "إخفاء إلى شريط النظام",
  showWidget: "إظهار الأداة",
  hideWidget: "إخفاء الأداة",
  muteP: "كتم صوت {p}",
  unmuteP: "تشغيل صوت {p}",
  location: "الموقع",
  searchCity: "ابحث عن مدينة",
  noCity: "لا توجد مدينة باسم «{q}». يمكنك إدخال الإحداثيات يدويًا في الأسفل.",
  regions: { kurdistan: "كردستان", iraq: "العراق", world: "العالم" },
  moreCities: "مدن أخرى حول العالم",
  searchingWorld: "جارٍ البحث في مدن العالم…",
  worldError: "تعذّر تحميل قائمة مدن العالم. حاول البحث مرة أخرى.",
  customPlace: "موقع مخصص",
  placeName: "الاسم",
  latitude: "خط العرض",
  longitude: "خط الطول",
  timezone: "المنطقة الزمنية",
  useCustom: "استخدام هذا الموقع",
  coordsInvalid: "يجب أن يكون خط العرض بين ‎-90 و 90، وخط الطول بين ‎-180 و 180.",
  calculation: "الحساب",
  method: "طريقة الحساب",
  madhab: "المذهب (لوقت العصر)",
  shafi: "الشافعي (القياسي)",
  hanafi: "الحنفي",
  offsets: "تعديل الدقائق لكل صلاة",
  offsetsHint: "لمطابقة توقيت مسجدك.",
  minutesShort: "دقيقة",
  sound: "الصوت",
  soundAdhan: "الأذان كاملًا",
  soundChime: "تنبيه قصير",
  soundSilent: "صامت",
  volume: "مستوى الصوت",
  test: "تجربة",
  stop: "إيقاف",
  adhanMissing: "ملف الأذان غير موجود. ضع ملف mp3 في public/audio/adhan.mp3؛ حتى ذلك الحين يُشغَّل التنبيه القصير.",
  reminder: "تذكير مسبق",
  reminderOff: "متوقف",
  reminderN: "قبل {n} دقيقة",
  display: "العرض",
  language: "اللغة",
  theme: "المظهر",
  themeSystem: "حسب النظام",
  themeLight: "فاتح",
  themeDark: "داكن",
  clock: "الساعة",
  clock12: "١٢ ساعة",
  clock24: "٢٤ ساعة",
  widget: "الأداة",
  widgetVisible: "إظهار الأداة",
  alwaysOnTop: "دائمًا فوق النوافذ",
  opacity: "شفافية الخلفية",
  lockPosition: "تثبيت موضع الأداة",
  unlockPosition: "إلغاء التثبيت",
  system: "النظام",
  autostart: "التشغيل مع بدء الحاسوب",
  autostartFailed: "تعذّر تغيير التشغيل التلقائي. حاول مرة أخرى.",
  desktopOnly: "يعمل فقط في تطبيق سطح المكتب.",
  notifTitle: "حان وقت صلاة {p}",
  notifSunrise: "الشروق",
  notifBody: "{city}",
  reminderTitle: "بقي {n} دقيقة على {p}",
  calcError: "تعذّر حساب الأوقات لهذا الموقع. تحقق من الإحداثيات أو اختر مدينة أخرى.",
  changePlace: "تغيير الموقع",
};

const en: Dict = {
  appName: "Sajda",
  prayers: { fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" },
  timeLeftUntil: "Until {p}",
  at: "at {t}",
  settings: "Settings",
  close: "Close",
  minimize: "Minimize",
  hideToTray: "Hide to tray",
  showWidget: "Show widget",
  hideWidget: "Hide widget",
  muteP: "Mute {p}",
  unmuteP: "Unmute {p}",
  location: "Location",
  searchCity: "Search for a city",
  noCity: "No city matches “{q}”. You can enter coordinates below.",
  regions: { kurdistan: "Kurdistan", iraq: "Iraq", world: "World" },
  moreCities: "More cities worldwide",
  searchingWorld: "Searching cities worldwide…",
  worldError: "The world city list didn't load. Try searching again.",
  customPlace: "Custom location",
  placeName: "Name",
  latitude: "Latitude",
  longitude: "Longitude",
  timezone: "Time zone",
  useCustom: "Use this location",
  coordsInvalid: "Latitude must be between -90 and 90, longitude between -180 and 180.",
  calculation: "Calculation",
  method: "Calculation method",
  madhab: "Madhab (for Asr)",
  shafi: "Shafi (standard)",
  hanafi: "Hanafi",
  offsets: "Minute adjustment per prayer",
  offsetsHint: "Match the times your mosque announces.",
  minutesShort: "min",
  sound: "Sound",
  soundAdhan: "Full adhan",
  soundChime: "Short chime",
  soundSilent: "Silent",
  volume: "Volume",
  test: "Test",
  stop: "Stop",
  adhanMissing: "No adhan file yet. Put an mp3 at public/audio/adhan.mp3; until then the short chime plays.",
  reminder: "Reminder before prayer",
  reminderOff: "Off",
  reminderN: "{n} min before",
  display: "Display",
  language: "Language",
  theme: "Theme",
  themeSystem: "Match system",
  themeLight: "Light",
  themeDark: "Dark",
  clock: "Clock",
  clock12: "12-hour",
  clock24: "24-hour",
  widget: "Widget",
  widgetVisible: "Show widget",
  alwaysOnTop: "Keep above other windows",
  opacity: "Background opacity",
  lockPosition: "Lock widget position",
  unlockPosition: "Unlock position",
  system: "System",
  autostart: "Open when the computer starts",
  autostartFailed: "Couldn't change the startup setting. Try again.",
  desktopOnly: "Only works in the desktop app.",
  notifTitle: "Time for {p}",
  notifSunrise: "Sunrise",
  notifBody: "{city}",
  reminderTitle: "{n} minutes until {p}",
  calcError: "Prayer times can't be calculated for this location. Check the coordinates or pick another city.",
  changePlace: "Change location",
};

const dicts: Record<Lang, Dict> = { ckb, ar, en };

type StringKey = { [K in keyof Dict]: Dict[K] extends string ? K : never }[keyof Dict];

export function t(lang: Lang, key: StringKey, vars: Record<string, string | number> = {}): string {
  return dicts[lang][key].replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ""));
}

export function prayerName(lang: Lang, key: PrayerKey): string {
  return dicts[lang].prayers[key];
}

export function regionName(lang: Lang, region: keyof Dict["regions"]): string {
  return dicts[lang].regions[region];
}

export function dirOf(lang: Lang): "rtl" | "ltr" {
  return lang === "en" ? "ltr" : "rtl";
}

export function placeName(lang: Lang, place: Place): string {
  return place.names[lang] ?? place.names.en;
}

export const METHOD_LABELS: Record<MethodKey, Record<Lang, string>> = {
  MuslimWorldLeague: { ckb: "ڕابیتەی جیهانی ئیسلامی (MWL)", ar: "رابطة العالم الإسلامي", en: "Muslim World League" },
  Egyptian: { ckb: "دەزگای ڕووپێوی میسری", ar: "الهيئة المصرية العامة للمساحة", en: "Egyptian General Authority" },
  Karachi: { ckb: "زانکۆی زانستە ئیسلامییەکان، کەراچی", ar: "جامعة العلوم الإسلامية، كراتشي", en: "University of Islamic Sciences, Karachi" },
  UmmAlQura: { ckb: "ئوم ئەلقورا، مەککە", ar: "أم القرى، مكة", en: "Umm al-Qura, Makkah" },
  Dubai: { ckb: "دوبەی", ar: "دبي", en: "Dubai" },
  Qatar: { ckb: "قەتەر", ar: "قطر", en: "Qatar" },
  Kuwait: { ckb: "کوەیت", ar: "الكويت", en: "Kuwait" },
  MoonsightingCommittee: { ckb: "لیژنەی بینینی مانگ", ar: "لجنة رؤية الهلال", en: "Moonsighting Committee" },
  Turkey: { ckb: "تورکیا (دیانەت)", ar: "تركيا (ديانت)", en: "Turkey (Diyanet)" },
  Tehran: { ckb: "زانکۆی تاران", ar: "جامعة طهران", en: "University of Tehran" },
  NorthAmerica: { ckb: "ئەمریکای باکوور (ISNA)", ar: "أمريكا الشمالية (ISNA)", en: "North America (ISNA)" },
};

const EASTERN_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Dates read naturally in Eastern Arabic digits; clock times stay Western, like mosque boards. */
export function localDigits(lang: Lang, value: string | number): string {
  const text = String(value);
  if (lang === "en") return text;
  return text.replace(/\d/g, (d) => EASTERN_DIGITS[Number(d)]);
}

const GREGORIAN_MONTHS: Record<Exclude<Lang, "en">, string[]> = {
  ckb: ["کانوونی دووەم", "شوبات", "ئازار", "نیسان", "ئایار", "حوزەیران", "تەممووز", "ئاب", "ئەیلوول", "تشرینی یەکەم", "تشرینی دووەم", "کانوونی یەکەم"],
  ar: ["كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"],
};
const HIJRI_MONTHS: Record<Lang, string[]> = {
  ckb: ["موحەڕڕەم", "سەفەر", "ڕەبیعی یەکەم", "ڕەبیعی دووەم", "جومادای یەکەم", "جومادای دووەم", "ڕەجەب", "شەعبان", "ڕەمەزان", "شەوال", "زولقەعدە", "زولحیججە"],
  ar: ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"],
  en: ["Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani", "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Shaban", "Ramadan", "Shawwal", "Dhu al-Qadah", "Dhu al-Hijjah"],
};
/** Kurdish solar months; they align with the Persian solar calendar, year + 1321. */
const KURDISH_MONTHS = ["خاکەلێوە", "گوڵان", "جۆزەردان", "پووشپەڕ", "گەلاوێژ", "خەرمانان", "ڕەزبەر", "خەزەڵوەر", "سەرماوەز", "بەفرانبار", "ڕێبەندان", "ڕەشەمە"];
const WEEKDAYS: Record<Exclude<Lang, "en">, string[]> = {
  ckb: ["یەکشەممە", "دووشەممە", "سێشەممە", "چوارشەممە", "پێنجشەممە", "هەینی", "شەممە"],
  ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
};

function calendarParts(date: Date, tz: string, calendar: string) {
  const parts = new Intl.DateTimeFormat(`en-u-ca-${calendar}-nu-latn`, {
    timeZone: tz,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? NaN);
  return { year: get("year"), month: get("month"), day: get("day") };
}

function weekdayIndex(date: Date, tz: string): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

export interface DateLines {
  weekday: string;
  gregorian: string;
  hijri: string;
  /** Only present for Kurdish. */
  kurdish?: string;
}

export function formatDates(lang: Lang, date: Date, tz: string): DateLines {
  const g = calendarParts(date, tz, "gregory");
  const h = calendarParts(date, tz, "islamic-umalqura");
  const hijriMonth = HIJRI_MONTHS[lang][h.month - 1] ?? "";

  if (lang === "en") {
    return {
      weekday: new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "long" }).format(date),
      gregorian: new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric", month: "long", year: "numeric" }).format(date),
      hijri: `${h.day} ${hijriMonth} ${h.year} AH`,
    };
  }

  const suffix = lang === "ckb" ? "ی" : "";
  const lines: DateLines = {
    weekday: WEEKDAYS[lang][weekdayIndex(date, tz)] ?? "",
    gregorian: localDigits(lang, `${g.day}${suffix} ${GREGORIAN_MONTHS[lang][g.month - 1]} ${g.year}`),
    hijri: localDigits(lang, `${h.day}${suffix} ${hijriMonth} ${h.year}`),
  };
  if (lang === "ckb") {
    const p = calendarParts(date, tz, "persian");
    lines.kurdish = localDigits(lang, `${p.day}ی ${KURDISH_MONTHS[p.month - 1]} ${p.year + 1321}`);
  }
  return lines;
}

export function formatClock(date: Date, tz: string, clock: "12" | "24"): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: clock === "12" ? "numeric" : "2-digit",
    minute: "2-digit",
    hour12: clock === "12",
  }).format(date);
}

/** h:mm:ss, with hours dropped under one hour. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
