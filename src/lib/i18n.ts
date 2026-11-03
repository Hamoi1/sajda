import type { Lang, MethodKey, Place, PrayerKey } from "./types";

const ckb = {
  appName: "سەجدە",
  prayers: { fajr: "بەیانی", sunrise: "خۆرهەڵاتن", dhuhr: "نیوەڕۆ", asr: "عەسر", maghrib: "مەغریب", isha: "عیشا" },
  timeLeftUntil: "ماوە بۆ {p}",
  at: "کاتژمێر {t}",
  settings: "ڕێکخستنەکان",
  close: "داخستن",
  minimize: "بچووککردنەوە",
  hideToTray: "بۆ تری بشارەوە",
  showWidget: "پیشاندانی ویجێت",
  hideWidget: "شاردنەوەی ویجێت",
  muteP: "بێدەنگکردنی {p}",
  unmuteP: "دەنگی {p} بگەڕێنەوە",
  location: "شوێن",
  searchCity: "گەڕان بۆ شار",
  noCity: "هیچ شارێک نەدۆزرایەوە بە ناوی «{q}». دەتوانیت پانی و درێژی بە دەست لە خوارەوە بنووسیت.",
  regions: { kurdistan: "کوردستان", iraq: "عێراق", world: "جیهان" },
  moreCities: "شارەکانی تری جیهان",
  searchingWorld: "گەڕان لە شارەکانی جیهان…",
  worldError: "لیستی شارەکانی جیهان بار نەبوو. تکایە دووبارە هەوڵ بدەوە.",
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
  offsets: "گۆڕینی خولەکی هەر بانگێک",
  offsetsHint: "بۆ یەکخستنی کاتەکان لەگەڵ تەوقیتی مزگەوتەکەت.",
  minutesShort: "خولەک",
  sound: "دەنگ",
  soundAdhan: "بانگی تەواو",
  soundChime: "زەنگی کورت",
  soundSilent: "بێدەنگ",
  volume: "بەرزی دەنگ",
  test: "تاقیکردنەوە",
  stop: "ڕاگرتن",
  adhanMissing: "هێشتا فایلی بانگ دانەنراوە. فایلێکی mp3 لە ڕێڕەوی public/audio/adhan.mp3 دابنێ؛ تا ئەوکات زەنگی کورت دەلێدرێت.",
  reminder: "ئاگادارکردنەوە پێش بانگ",
  adhanVoice: "دەنگی بانگ",
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
  widgetVisible: "پیشاندانی ویجێت",
  alwaysOnTop: "هەمیشە لە سەرەوەی پەنجەرەکان",
  opacity: "ڕوونی پاشبنەما",
  lockPosition: "چەسپاندنی شوێنی ویجێت",
  unlockPosition: "لابردنی چەسپاندن",
  system: "سیستەم",
  autostart: "کردنەوەی خۆکار لەگەڵ هەڵکردنی کۆمپیوتەر",
  autostartFailed: "نەتوانرا ڕێکخستنی کردنەوەی خۆکار بگۆڕدرێت. دووبارە هەوڵ بدەوە.",
  desktopOnly: "تەنها لە ئەپی دێسکتۆپدا کار دەکات.",
  notifTitle: "کاتی بانگی {p}",
  notifSunrise: "خۆرهەڵاتن",
  notifBody: "{city}",
  reminderTitle: "{n} خولەک ماوە بۆ {p}",
  calcError: "ناتوانرێت کاتەکان بۆ ئەم شوێنە هەژمار بکرێن. پانی و درێژییەکە بپشکنە یان شارێکی تر هەڵبژێرە.",
  changePlace: "گۆڕینی شوێن",
  // Tabs
  tabs: "بەشەکان",
  tabHome: "سەرەکی",
  tabAzkar: "ئەذکار",
  tabTasbih: "تەسبیح",
  // Azkar
  azkarGeneral: "گشتی",
  azkarMorning: "بەیانیان",
  azkarEvening: "ئێواران",
  azkarRepeatN: "{n} جار",
  azkarRemaining: "ماوە: {n}",
  azkarDone: "تەواو بوو",
  azkarTapToCount: "بۆ ژماردن دەستی بکە",
  // Tasbih
  tasbihCount: "ژمارە",
  tasbihTarget: "ئامانج",
  tasbihCycles: "دەورە",
  tasbihDaily: "ئەمڕۆ",
  tasbihReset: "سفرکردنەوە",
  tasbihTapHint: "بۆ ژماردن دەستی بکە",
  tasbihTargetReached: "ئامانجەکە تەواو بوو",
  // Quran reader
  readerTitle: "خوێندنەوەی قورئان",
  readerIntro: "ئەم سورەتە تا کۆتایی بخوێنە؛ تا تەواوی نەکەیت، پەنجەرەکە داخراو دەمێنێتەوە و هیچ شتێک ناکرێت.",
  readerNext: "ئایەتی داهاتوو",
  readerFinish: "تەواوم کرد",
  readerFinishedMsg: "بەختەوەر بیت — خوێندنەوە تەواو بوو.",
  readerAyahOf: "ئایەتی {a} لە {n}",
  notifReaderTitle: "کاتی خوێندنەوەی قورئان",
  notifReaderBody: "سورەتی {s} بخوێنە",
  // Reader settings
  quranLock: "خوێندنەوەی قورئان",
  quranLockEnable: "چالاککردنی داخستنی خوێندنەوە",
  quranLockHint: "لە کاتێکی دیاریکراو یان دوای بانگ، سورەتێک دەکرێتەوە و تا تەواوی نەخوێنرێتەوە دادەخرێت.",
  quranLockAfterAdhan: "خولەک دوای بانگ",
  quranLockAfterAdhanOff: "کوژاوە",
  quranLockTimes: "کاتەکانی ڕۆژانە",
  quranLockTimesHint: "بە کۆما جیا بکەوە، بۆ نموونە 21:00, 05:30",
  quranLockTimesInvalid: "کاتەکە دروست نییە. شێوازی HH:MM بەکاربهێنە.",
  quranLockMode: "هەڵبژاردنی سورەت",
  quranLockRandom: "هەڕەمەکی لە لیستەکە",
  quranLockFixed: "سورەتێکی دیاریکراو",
  quranLockPool: "لیستی سورەتەکان",
  quranLockPoolHint: "ژمارەی سورەتەکان بە کۆما جیا بکەوە (بۆ نموونە 78-114).",
  quranLockSurahN: "ژمارەی سورەت",
  // Widget v2
  widgetTheme: "ڕووکاری ویجێت",
  widgetSize: "قەبارە",
  widgetSizeSmall: "بچووک",
  widgetSizeStandard: "ئاسایی",
  widgetSizeLarge: "گەورە",
  widgetSizeHuge: "زۆر گەورە",
  widgetPreview: "پێشبینین",
  wThemeIndigoGold: "شەوی نیلی و زێڕین",
  wThemeGlass: "شووشەیی",
  wThemeClassic: "کلاسیکی",
  wThemeKilim: "کەلیم",
  wThemeMinimal: "سادە",
  wThemeMidnight: "نیوەشەو",
  // Updates
  updates: "نوێکاری",
  updatesEnable: "پشکنین بۆ نوێکاری",
  updatesHint: "تەنها بۆ بوونی وەشانێکی نوێ دەپشکنێت؛ هیچ زانیارییەک نانێرێت.",
  updateAvailable: "نوێکاری بەردەستە: v{v}",
  updateOpenReleases: "کردنەوەی پەڕەی داگرتن",
  settingsTimes: "شوێن و کات",
  settingsTimesHint: "شار، شێوازی هەژمارکردن و ڕێکخستنی خولەک بۆ هەر بانگێک.",
  settingsGeneral: "گشتی",
  settingsGeneralHint: "زمان، ڕووکار، کاتژمێر و ڕێکخستنەکانی سیستەم.",
  locationHint: "شار یان پانی و درێژی هەڵبژێرە.",
  calculationHint: "شێوازی هەژمارکردن و ڕێکخستنی خولەک.",
  soundHint: "بانگ، زەنگ و ئاگادارکردنەوەی پێشوەختە.",
  displayHint: "زمان، ڕووکار و کاتژمێر.",
  widgetHint: "ڕووکار و قەبارەی ویجێتی سەر دێسکتۆپ.",
  officialBadge: "تەوقیتی فەرمی",
  obStep: "{n} لە ٣",
  obWelcome: "بەخێربێیت بۆ سەجدە",
  obWelcomeHint: "زمانێک هەڵبژێرە. کاتەکانی بانگ بەبێ ئینتەرنێت لەسەر کۆمپیوتەرەکەت هەژمار دەکرێن.",
  obCity: "لە کوێ نوێژ دەکەیت؟",
  obSound: "کاتی بانگ چۆن ئاگادارت بکەینەوە؟",
  obSoundAdhanHint: "لە کاتی هەموو بانگێک",
  obSoundChimeHint: "کورت و ئارام",
  obSoundSilentHint: "تەنها ئاگادارکردنەوە",
  obWidget: "ویجێت لەسەر دێسکتۆپ پیشان بدە",
  obWidgetHint: "هەمیشە لە سەرەوەی پەنجەرەکانی ترە",
  obNext: "بەردەوامبە",
  obBack: "گەڕانەوە",
  obStart: "دەستپێبکە",
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
  unmuteP: "إلغاء كتم {p}",
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
  adhanMissing: "ملف الأذان غير مضاف بعد. ضع ملف mp3 في المسار public/audio/adhan.mp3؛ وإلى ذلك الحين يُشغَّل التنبيه القصير.",
  reminder: "تذكير مسبق",
  adhanVoice: "صوت الأذان",
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
  tabs: "الأقسام",
  tabHome: "الرئيسية",
  tabAzkar: "الأذكار",
  tabTasbih: "التسبيح",
  azkarGeneral: "عامة",
  azkarMorning: "أذكار الصباح",
  azkarEvening: "أذكار المساء",
  azkarRepeatN: "{n} مرة",
  azkarRemaining: "بقي {n}",
  azkarDone: "تمّت",
  azkarTapToCount: "انقر للعدّ",
  tasbihCount: "العدد",
  tasbihTarget: "الهدف",
  tasbihCycles: "الدورات",
  tasbihDaily: "اليوم",
  tasbihReset: "تصفير",
  tasbihTapHint: "انقر للتسبيح",
  tasbihTargetReached: "تم بلوغ الهدف",
  readerTitle: "قراءة القرآن",
  readerIntro: "اقرأ هذه السورة حتى نهايتها؛ تبقى النافذة مقفلة حتى تُتمّ القراءة.",
  readerNext: "الآية التالية",
  readerFinish: "أتممت القراءة",
  readerFinishedMsg: "بارك الله فيك — اكتملت القراءة.",
  readerAyahOf: "الآية {a} من {n}",
  notifReaderTitle: "وقت قراءة القرآن",
  notifReaderBody: "اقرأ سورة {s}",
  quranLock: "قراءة القرآن",
  quranLockEnable: "تفعيل قفل القراءة",
  quranLockHint: "في وقت محدد أو بعد الأذان، تُفتح سورة تبقى مقفلة حتى تُقرأ كاملة.",
  quranLockAfterAdhan: "دقائق بعد الأذان",
  quranLockAfterAdhanOff: "معطّل",
  quranLockTimes: "أوقات يومية",
  quranLockTimesHint: "افصل بفاصلة، مثال: 21:00, 05:30",
  quranLockTimesInvalid: "الوقت غير صالح. استخدم صيغة HH:MM.",
  quranLockMode: "اختيار السورة",
  quranLockRandom: "عشوائي من القائمة",
  quranLockFixed: "سورة محددة",
  quranLockPool: "قائمة السور",
  quranLockPoolHint: "أرقام السور مفصولة بفاصلة (مثال: 78-114).",
  quranLockSurahN: "رقم السورة",
  widgetTheme: "مظهر الأداة",
  widgetSize: "الحجم",
  widgetSizeSmall: "صغير",
  widgetSizeStandard: "عادي",
  widgetSizeLarge: "كبير",
  widgetSizeHuge: "كبير جدًا",
  widgetPreview: "معاينة",
  wThemeIndigoGold: "ليل نيلي وذهبي",
  wThemeGlass: "زجاجي",
  wThemeClassic: "كلاسيكي",
  wThemeKilim: "كليم",
  wThemeMinimal: "بسيط",
  wThemeMidnight: "منتصف الليل",
  updates: "التحديثات",
  updatesEnable: "التحقق من وجود تحديث",
  updatesHint: "لا يتحقق إلا من وجود إصدار أحدث، ولا يرسل أي بيانات.",
  updateAvailable: "تحديث متاح: v{v}",
  updateOpenReleases: "فتح صفحة التنزيل",
  settingsTimes: "الموقع والوقت",
  settingsTimesHint: "المدينة وطريقة الحساب وتعديل الدقائق لكل صلاة.",
  settingsGeneral: "عام",
  settingsGeneralHint: "اللغة والمظهر والساعة وإعدادات النظام.",
  locationHint: "اختر مدينة أو أدخل الإحداثيات.",
  calculationHint: "طريقة الحساب وتعديل الدقائق.",
  soundHint: "الأذان والتنبيه والتذكير المسبق.",
  displayHint: "اللغة والمظهر والساعة.",
  widgetHint: "مظهر وحجم أداة سطح المكتب.",
  officialBadge: "التوقيت الرسمي",
  obStep: "{n} من ٣",
  obWelcome: "أهلاً بك في سجدة",
  obWelcomeHint: "اختر لغة. تُحسب مواقيت الصلاة على جهازك دون إنترنت.",
  obCity: "أين تصلّي؟",
  obSound: "كيف ننبهك عند الأذان؟",
  obSoundAdhanHint: "عند كل أذان",
  obSoundChimeHint: "قصير وهادئ",
  obSoundSilentHint: "إشعار فقط",
  obWidget: "اعرض الأداة على سطح المكتب",
  obWidgetHint: "تبقى دائماً فوق النوافذ الأخرى",
  obNext: "متابعة",
  obBack: "رجوع",
  obStart: "ابدأ",
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
  adhanMissing: "No adhan file yet. Place an MP3 at public/audio/adhan.mp3 — until then, the short chime plays instead.",
  reminder: "Reminder before prayer",
  adhanVoice: "Adhan voice",
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
  tabs: "Sections",
  tabHome: "Home",
  tabAzkar: "Azkar",
  tabTasbih: "Tasbih",
  azkarGeneral: "General",
  azkarMorning: "Morning",
  azkarEvening: "Evening",
  azkarRepeatN: "{n} times",
  azkarRemaining: "{n} left",
  azkarDone: "Done",
  azkarTapToCount: "Tap to count",
  tasbihCount: "Count",
  tasbihTarget: "Target",
  tasbihCycles: "Cycles",
  tasbihDaily: "Today",
  tasbihReset: "Reset",
  tasbihTapHint: "Tap to count",
  tasbihTargetReached: "Target reached",
  readerTitle: "Quran reading",
  readerIntro: "Read this surah to the end; the window stays locked until you finish.",
  readerNext: "Next ayah",
  readerFinish: "I finished",
  readerFinishedMsg: "Well done — reading complete.",
  readerAyahOf: "Ayah {a} of {n}",
  notifReaderTitle: "Time to read Quran",
  notifReaderBody: "Read surah {s}",
  quranLock: "Quran reading",
  quranLockEnable: "Enable reading lock",
  quranLockHint: "At a set time or after the adhan, a surah opens and stays locked until fully read.",
  quranLockAfterAdhan: "Minutes after adhan",
  quranLockAfterAdhanOff: "Off",
  quranLockTimes: "Daily times",
  quranLockTimesHint: "Separate with commas, e.g. 21:00, 05:30",
  quranLockTimesInvalid: "Invalid time. Use HH:MM.",
  quranLockMode: "Surah selection",
  quranLockRandom: "Random from list",
  quranLockFixed: "Fixed surah",
  quranLockPool: "Surah list",
  quranLockPoolHint: "Surah numbers separated by commas (e.g. 78-114).",
  quranLockSurahN: "Surah number",
  widgetTheme: "Widget theme",
  widgetSize: "Size",
  widgetSizeSmall: "Small",
  widgetSizeStandard: "Standard",
  widgetSizeLarge: "Large",
  widgetSizeHuge: "Huge",
  widgetPreview: "Preview",
  wThemeIndigoGold: "Indigo night & gold",
  wThemeGlass: "Glass",
  wThemeClassic: "Classic",
  wThemeKilim: "Kilim",
  wThemeMinimal: "Minimal",
  wThemeMidnight: "Midnight",
  updates: "Updates",
  updatesEnable: "Check for updates",
  updatesHint: "Checks for a newer release only — no other data is sent.",
  updateAvailable: "Update available: v{v}",
  updateOpenReleases: "Open download page",
  settingsTimes: "Location & time",
  settingsTimesHint: "City, calculation method and per-prayer minute adjustments.",
  settingsGeneral: "General",
  settingsGeneralHint: "Language, theme, clock and system settings.",
  locationHint: "Pick a city or enter coordinates.",
  calculationHint: "Calculation method and minute adjustments.",
  soundHint: "Adhan, chime and reminders.",
  displayHint: "Language, theme and clock.",
  widgetHint: "Theme and size of the desktop widget.",
  officialBadge: "Official timetable",
  obStep: "Step {n} of 3",
  obWelcome: "Welcome to Sajda",
  obWelcomeHint: "Pick a language. Prayer times are calculated on your computer, with no internet needed.",
  obCity: "Where do you pray?",
  obSound: "How should we tell you it is time?",
  obSoundAdhanHint: "At every prayer",
  obSoundChimeHint: "Short and quiet",
  obSoundSilentHint: "A notification only",
  obWidget: "Show the widget on the desktop",
  obWidgetHint: "It stays above your other windows",
  obNext: "Continue",
  obBack: "Back",
  obStart: "Start",
};

const dicts: Record<Lang, Dict> = { ckb, ar, en };

export type StringKey = { [K in keyof Dict]: Dict[K] extends string ? K : never }[keyof Dict];

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
  Kurdistan: { ckb: "کوردستان — تەوقیتی فەرمی مزگەوتەکان", ar: "كردستان — التوقيت الرسمي للمساجد", en: "Kurdistan — official mosque convention" },
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
// Kurdish solar months in calendar order starting with Newroz (21 March):
// نیسەن، بانەمەڕ، جۆزەردان، پووشپەڕ، گەلاوێژ، خەرمانان، گەلاڕێزان،
// سەرماوەز، بەفرانبار، ڕێبەندان، ڕەشەمە، خاکەلێوە.
// They align with the Persian solar calendar slots, year + 1321.
const KURDISH_MONTHS = ["نیسەن", "بانەمەڕ", "جۆزەردان", "پووشپەڕ", "گەلاوێژ", "خەرمانان", "گەلاڕێزان", "سەرماوەز", "بەفرانبار", "ڕێبەندان", "ڕەشەمە", "خاکەلێوە"];
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
