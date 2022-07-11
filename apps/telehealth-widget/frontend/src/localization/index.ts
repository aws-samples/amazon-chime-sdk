import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';

/**
 * Amazon Chime SDK Widget Demo uses the "i18next" library to support localization.
 * https://www.i18next.com/
 * https://react.i18next.com/
 *
 * Do the following steps to support other languages.
 * 1. Remove the "lng" option from the "init" options.
 *    The "i18next-browser-languagedetector" library detects user language.
 *    See https://www.npmjs.com/package/i18next-browser-languagedetector for more information.
 * 2. Create a new language file in the "localization" directory. For example, "fr.json"
 * 3. Copy the content of "en.json" to your language file.
 * 4. Import and add your language file to the "resources" variable.
 * 5. Reset your localStorage and cookies, and restart your application. For example, change the browser language
 *    and ensure that you see translated strings from your new language file.
 */

const resources = {
  en: {
    translation: en,
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    // Remove the "lng" option to detect a language in a browser.
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
