import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "fr" | "es" | "sw" | "ar";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

type Dict = Record<string, string>;

const DICT: Record<Lang, Dict> = {
  en: {
    "nav.home": "Home", "nav.lab": "Lab", "nav.apparatus": "Apparatus",
    "nav.chemicals": "Chemicals", "nav.periodic": "Periodic Table",
    "nav.atomBuilder": "Atom Builder", "nav.structures": "Structures",
    "nav.syllabus": "Syllabus", "nav.pricing": "Pricing",
    "nav.launch": "Launch Lab", "common.search": "Search",
  },
  fr: {
    "nav.home": "Accueil", "nav.lab": "Laboratoire", "nav.apparatus": "Appareils",
    "nav.chemicals": "Produits chimiques", "nav.periodic": "Tableau périodique",
    "nav.atomBuilder": "Constructeur d'atome", "nav.structures": "Structures",
    "nav.syllabus": "Programme", "nav.pricing": "Tarifs",
    "nav.launch": "Ouvrir le labo", "common.search": "Rechercher",
  },
  es: {
    "nav.home": "Inicio", "nav.lab": "Laboratorio", "nav.apparatus": "Aparatos",
    "nav.chemicals": "Químicos", "nav.periodic": "Tabla periódica",
    "nav.atomBuilder": "Constructor de átomos", "nav.structures": "Estructuras",
    "nav.syllabus": "Plan de estudios", "nav.pricing": "Precios",
    "nav.launch": "Abrir laboratorio", "common.search": "Buscar",
  },
  sw: {
    "nav.home": "Nyumbani", "nav.lab": "Maabara", "nav.apparatus": "Vifaa",
    "nav.chemicals": "Kemikali", "nav.periodic": "Jedwali la Vipindi",
    "nav.atomBuilder": "Mjenzi wa Atomi", "nav.structures": "Miundo",
    "nav.syllabus": "Mtaala", "nav.pricing": "Bei",
    "nav.launch": "Fungua Maabara", "common.search": "Tafuta",
  },
  ar: {
    "nav.home": "الرئيسية", "nav.lab": "المختبر", "nav.apparatus": "الأجهزة",
    "nav.chemicals": "المواد الكيميائية", "nav.periodic": "الجدول الدوري",
    "nav.atomBuilder": "بناء الذرة", "nav.structures": "التركيبات",
    "nav.syllabus": "المنهج", "nav.pricing": "الأسعار",
    "nav.launch": "افتح المختبر", "common.search": "بحث",
  },
};

interface I18nCtx { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; }
const Ctx = createContext<I18nCtx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem("chemvm-lang") : null) as Lang | null;
    if (saved && DICT[saved]) setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("chemvm-lang", l);
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = l;
    }
  };
  const t = (k: string) => DICT[lang][k] ?? DICT.en[k] ?? k;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);