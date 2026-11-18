import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "./locales/ar.json";
import en from "./locales/en.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: "ar",
    fallbackLng: "ar",
    interpolation: {
      escapeValue: false,
    },
  });

// Update dir & lang on <html> whenever language changes
const setDirection = (lng) => {
  const dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
};

setDirection(i18n.language);
i18n.on("languageChanged", setDirection);

export default i18n;

