import { createContextId } from "@builder.io/qwik";
import type { Language } from "~/types";

export interface LanguageState {
  language: Language;
}

export const LanguageContext =
  createContextId<LanguageState>("language.global");
