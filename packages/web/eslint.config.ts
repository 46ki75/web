import type { Linter } from "eslint";
import configs, { globalIgnores } from "eslint/config";

import pluginVue from "eslint-plugin-vue";
import globals from "globals";

import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

const config = configs.defineConfig([
  // TypeScript
  ...(tseslint.configs.recommended as Linter.Config[]),
  {
    languageOptions: {
      parser: tseslint.parser as Linter.Parser,
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin as Linter,
    },
  },

  // Vue.js
  ...pluginVue.configs["flat/recommended"],
  {
    rules: {
      "vue/multi-word-component-names": "off",
    },
    languageOptions: {
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  },

  // Prettier
  eslintConfigPrettier,

  // General
  globalIgnores([
    "**/.nuxt/**/*",
    "**/.output/**/*",
    "**/dist/**/*",
    "**/node_modules/**/*",
  ]),
]);

export default config;
