import {
  flatten,
  resolveTemplate,
  translator,
  type Flatten,
} from "@solid-primitives/i18n";
import {
  createContext,
  createEffect,
  useContext,
  type Accessor,
  type ParentProps,
} from "solid-js";
import { isServer } from "solid-js/web";
import { localizePath, type Locale } from "./locale";
import { en, type RawDictionary } from "./messages/en";
import { ja } from "./messages/ja";

type Dictionary = Flatten<RawDictionary>;

const dictionaries: Record<Locale, Dictionary> = {
  en: flatten(en),
  ja: flatten(ja),
};

function createI18nValue(locale: Accessor<Locale>) {
  const t = translator(() => dictionaries[locale()], resolveTemplate);

  return {
    locale,
    t,
    localizePath: (path: string, targetLocale = locale()) =>
      localizePath(path, targetLocale),
  };
}

type I18nContextValue = ReturnType<typeof createI18nValue>;

const I18nContext = createContext<I18nContextValue>();

export function I18nProvider(props: ParentProps<{ locale: Accessor<Locale> }>) {
  const value = createI18nValue(() => props.locale());

  createEffect(() => {
    if (!isServer) document.documentElement.lang = props.locale();
  });

  return (
    <I18nContext.Provider value={value}>{props.children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
