import { createContextId } from "@builder.io/qwik";
import type { Language } from "~/types";

export type LanguageState = {
  language: Language;
};

export const LanguageContext =
  createContextId<LanguageState>("language.global");

export const languageMap: Record<Language, string> = {
  en: "English",
  ja: "日本語",
};
