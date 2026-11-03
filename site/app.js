// Language switch, platform detection and live download links.
// The page works without this file: every link falls back to the latest release page.
const REPO = "Hamoi1/sajda";

const STRINGS = {
  en: {
    skip: "Skip to content", name: "Sajda", download: "Download",
    heroTitle: "Prayer times that live on your desktop",
    heroLead: "Free and offline, in Kurdish, Arabic and English.",
    dlWindows: "Download for Windows", dlMac: "Download for macOS",
    versionFallback: "Latest release on GitHub", version: "Version {v}, released {d}",
    widgetTitle: "A countdown above every window",
    widgetBody: "The widget stays on top while you work. Pick one of six themes and four sizes, drag it anywhere, lock it in place, fade its background.",
    practiceTitle: "Azkar and tasbih, counted for you",
    azkarCap: "Morning, evening and general azkar with their sources. Tap a card to count; progress resets each day.",
    tasbihCap: "A tasbih that fills toward 33, 99, 100 or 500. Click, or hold the space bar.",
    accTitle: "Matches the official Kurdistan timetable",
    accBody: "Checked against a full year of published mosque tables, the average difference is about three minutes. Eleven more methods are built in, from Umm al-Qura to ISNA, and each prayer can be nudged to match your mosque.",
    readerTitle: "A surah before you scroll on",
    readerBody: "At the times you choose, a mushaf page opens above everything and reveals the surah ayah by ayah. It closes once the last ayah is read. The whole Quran is bundled, so it works offline.",
    dlTitle: "Download Sajda", osWin: "Windows 10 and 11", osMacArm: "macOS, Apple Silicon (M1 and later)", osMacIntel: "macOS, Intel", get: "Download",
    unsigned: "The installers are not code-signed yet. On Windows choose More info, then Run anyway. On macOS right-click the app and choose Open the first time.",
    source: "Source code", allReleases: "All releases", issue: "Report a problem", license: "MIT license",
    title: "Sajda: prayer times for your desktop",
  },
  ckb: {
    skip: "بڕۆ بۆ ناوەڕۆک", name: "سەجدە", download: "داگرتن",
    heroTitle: "کاتەکانی بانگ، هەمیشە لەسەر دێسکتۆپەکەت",
    heroLead: "بەخۆڕایی و بەبێ ئینتەرنێت، بە کوردی، عەرەبی و ئینگلیزی.",
    dlWindows: "داگرتن بۆ ویندۆز", dlMac: "داگرتن بۆ ماک",
    versionFallback: "دوایین وەشان لە GitHub", version: "وەشانی {v}، {d}",
    widgetTitle: "کاتژمێرێکی پاشماوە لە سەرووی هەموو پەنجەرەکان",
    widgetBody: "ویجێتەکە لە کاتی کارکردندا لە سەرەوە دەمێنێتەوە. شەش ڕووکار و چوار قەبارە، بیبە بۆ هەر شوێنێک، جێگیری بکە و ڕوونی پاشبنەماکەی کەم بکەرەوە.",
    practiceTitle: "ئەذکار و تەسبیح، بۆت دەژمێردرێن",
    azkarCap: "ئەذکاری بەیانیان، ئێواران و گشتی لەگەڵ سەرچاوەکانیان. کرتە لە کارتێک بکە بۆ ژماردن؛ هەموو ڕۆژێک سفر دەبێتەوە.",
    tasbihCap: "تەسبیحێک کە بەرەو ٣٣، ٩٩، ١٠٠ یان ٥٠٠ پڕ دەبێتەوە. کرتە بکە یان Space دابگرە.",
    accTitle: "وەک تەوقیتی فەرمیی کوردستان",
    accBody: "بەراورد کراوە لەگەڵ تەوقیتی بڵاوکراوەی مزگەوتەکان بۆ ساڵێکی تەواو؛ تێکڕای جیاوازی نزیکەی سێ خولەکە. یازدە شێوازی تریش هەن، لە ئوم ئەلقوراوە تا ISNA، و دەتوانیت هەر بانگێک بە خولەک ڕێک بخەیت.",
    readerTitle: "سوورەتێک پێش ئەوەی بەردەوام بیت",
    readerBody: "لەو کاتانەی دیاریی دەکەیت، پەڕەیەکی قورئان لە سەرووی هەموو شتێکەوە دەکرێتەوە و ئایەت بە ئایەت دەردەکەوێت. دوای خوێندنی دوایین ئایەت دادەخرێت. هەموو قورئان لەناو بەرنامەکەدایە، بەبێ ئینتەرنێت کار دەکات.",
    dlTitle: "داگرتنی سەجدە", osWin: "ویندۆز ١٠ و ١١", osMacArm: "ماک، Apple Silicon (M1 و دواتر)", osMacIntel: "ماک، Intel", get: "داگرتن",
    unsigned: "دامەزرێنەرەکان هێشتا واژۆی کۆدیان نییە. لە ویندۆز More info و پاشان Run anyway هەڵبژێرە. لە ماک بۆ یەکەم جار کلیکی ڕاست لە بەرنامەکە بکە و Open هەڵبژێرە.",
    source: "کۆدی سەرچاوە", allReleases: "هەموو وەشانەکان", issue: "ڕاپۆرتی کێشە", license: "مۆڵەتی MIT",
    title: "سەجدە: کاتەکانی بانگ بۆ دێسکتۆپ",
  },
  ar: {
    skip: "انتقل إلى المحتوى", name: "سجدة", download: "تحميل",
    heroTitle: "مواقيت الصلاة على سطح مكتبك دائماً",
    heroLead: "مجاني ويعمل دون إنترنت، بالكردية والعربية والإنجليزية.",
    dlWindows: "تحميل لويندوز", dlMac: "تحميل لماك",
    versionFallback: "أحدث إصدار على GitHub", version: "الإصدار {v}، {d}",
    widgetTitle: "عدّ تنازلي فوق كل النوافذ",
    widgetBody: "تبقى الأداة فوق النوافذ أثناء عملك. ستة أنماط وأربعة أحجام، اسحبها إلى أي مكان، ثبّتها، وخفّف شفافية خلفيتها.",
    practiceTitle: "الأذكار والتسبيح، تُعدّ لك",
    azkarCap: "أذكار الصباح والمساء والأذكار العامة مع مصادرها. اضغط على البطاقة للعدّ؛ يُعاد التقدم كل يوم.",
    tasbihCap: "مسبحة تمتلئ نحو ٣٣ أو ٩٩ أو ١٠٠ أو ٥٠٠. اضغط، أو استمر بالضغط على مفتاح المسافة.",
    accTitle: "تطابق التقويم الرسمي لكوردستان",
    accBody: "قورنت بجداول المساجد المنشورة لعام كامل، ومتوسط الفرق نحو ثلاث دقائق. وتتوفر إحدى عشرة طريقة أخرى، من أم القرى إلى ISNA، ويمكن تعديل كل صلاة بالدقائق لتطابق مسجدك.",
    readerTitle: "سورة قبل أن تكمل يومك",
    readerBody: "في الأوقات التي تختارها، تُفتح صفحة من المصحف فوق كل شيء وتظهر السورة آية بعد آية، وتُغلق بعد قراءة الآية الأخيرة. القرآن كاملاً مضمّن، فتعمل دون إنترنت.",
    dlTitle: "تحميل سجدة", osWin: "ويندوز ١٠ و١١", osMacArm: "ماك، Apple Silicon (M1 وما بعده)", osMacIntel: "ماك، Intel", get: "تحميل",
    unsigned: "المثبّتات غير موقّعة رقمياً بعد. في ويندوز اختر More info ثم Run anyway. في ماك انقر بالزر الأيمن على التطبيق واختر Open في المرة الأولى.",
    source: "الشيفرة المصدرية", allReleases: "كل الإصدارات", issue: "الإبلاغ عن مشكلة", license: "رخصة MIT",
    title: "سجدة: مواقيت الصلاة لسطح المكتب",
  },
};

let lang = "en";
let release = null;

const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

function setLang(next) {
  lang = STRINGS[next] ? next : "en";
  const t = STRINGS[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
  document.title = t.title;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (t[key]) el.textContent = t[key];
  });
  document.querySelectorAll(".lang").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  applyPlatform();
  applyRelease();
  try { localStorage.setItem("sajda-lang", lang); } catch { /* private mode: keep the choice for this visit only */ }
}

// macOS on Apple Silicon and Intel report the same platform string, so a Mac
// visitor gets the Apple Silicon build first and both are listed below.
function platform() {
  const p = (navigator.userAgentData?.platform || navigator.platform || "").toLowerCase();
  if (p.includes("mac")) return "mac";
  return "win";
}

function applyPlatform() {
  const t = STRINGS[lang];
  const primary = document.getElementById("primary-dl");
  const secondary = document.getElementById("secondary-dl");
  const mac = platform() === "mac";
  primary.textContent = mac ? t.dlMac : t.dlWindows;
  primary.dataset.asset = mac ? "arm" : "exe";
  secondary.textContent = mac ? t.dlWindows : t.dlMac;
  secondary.dataset.asset = mac ? "exe" : "arm";
}

const MATCH = {
  exe: (n) => /x64-setup\.exe$/i.test(n),
  arm: (n) => /aarch64\.dmg$/i.test(n),
  intel: (n) => /x64\.dmg$/i.test(n),
};

function applyRelease() {
  if (!release) return;
  const t = STRINGS[lang];
  const date = new Date(release.published_at).toLocaleDateString(lang === "en" ? "en-GB" : lang, { day: "numeric", month: "long", year: "numeric" });
  document.getElementById("version-line").textContent = fill(t.version, { v: release.tag_name.replace(/^v/, ""), d: date });
  document.querySelectorAll("[data-asset]").forEach((a) => {
    const asset = release.assets.find((x) => MATCH[a.dataset.asset]?.(x.name));
    if (asset) a.href = asset.browser_download_url;
  });
  document.querySelectorAll("[data-file]").forEach((p) => {
    const asset = release.assets.find((x) => MATCH[p.dataset.file]?.(x.name));
    if (asset) p.textContent = `${asset.name}, ${(asset.size / 1048576).toFixed(1)} MB`;
  });
}

async function loadRelease() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) return;
    release = await res.json();
    applyRelease();
  } catch {
    // Offline or rate-limited: the links already point at the release page.
  }
}

document.querySelectorAll(".lang").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

let saved = null;
try { saved = localStorage.getItem("sajda-lang"); } catch { /* storage blocked */ }
const browser = (navigator.language || "en").slice(0, 3).toLowerCase();
setLang(saved || (browser.startsWith("ckb") || browser.startsWith("ku") ? "ckb" : browser.startsWith("ar") ? "ar" : "en"));
loadRelease();
