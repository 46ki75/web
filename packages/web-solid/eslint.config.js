import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import globals from "globals";
import solid from "eslint-plugin-solid/configs/typescript";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

const ignores = [
  "**/*.log",
  "**/.DS_Store",
  "**/*.",
  ".vscode/settings.json",
  "**/.history",
  "**/.yarn",
  "**/bazel-*",
  "**/bazel-bin",
  "**/bazel-out",
  "**/bazel-testlogs",
  "**/dist",
  "**/dist-dev",
  "**/lib",
  "**/lib-types",
  "**/etc",
  "**/external",
  "**/node_modules",
  "**/temp",
  "**/tsc-out",
  "**/tsdoc-metadata.json",
  "**/target",
  "**/output",
  "**/rollup.config.js",
  "**/build",
  "**/.cache",
  "**/.vscode",
  "**/.rollup.cache",
  "**/dist",
  "**/tsconfig.tsbuildinfo",
  "**/.netlify",
  "**/pnpm-lock.yaml",
  "**/package-lock.json",
  "**/yarn.lock",
  "**/server",
  "eslint.config.js",
];

const strictRules = {
  eqeqeq: ["error", "always", { null: "ignore" }],
  curly: ["error", "all"],
  "consistent-return": "error",
  "default-case-last": "error",
  "guard-for-in": "error",
  radix: "error",
  "@typescript-eslint/ban-ts-comment": [
    "error",
    { minimumDescriptionLength: 10 },
  ],
  "@typescript-eslint/no-meaningless-void-operator": "error",
  "@typescript-eslint/no-misused-spread": "error",
  "@typescript-eslint/no-mixed-enums": "error",
  "@typescript-eslint/no-useless-default-assignment": "error",
  "@typescript-eslint/related-getter-setter-pairs": "error",
  "@typescript-eslint/return-await": [
    "error",
    "error-handling-correctness-only",
  ],
  "@typescript-eslint/switch-exhaustiveness-check": "error",
  "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
  "@typescript-eslint/no-base-to-string": "warn",
  "@typescript-eslint/no-unsafe-argument": "warn",
  "@typescript-eslint/no-unsafe-assignment": "warn",
  "@typescript-eslint/no-unsafe-call": "warn",
  "@typescript-eslint/no-unsafe-member-access": "warn",
  "@typescript-eslint/no-unsafe-return": "warn",
  "@typescript-eslint/require-await": "warn",
  "@typescript-eslint/unbound-method": "warn",
};

const typeScriptConfig = {
  files: ["**/*.{ts,tsx,mts,cts}"],
  extends: [
    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    solid,
  ],
  linterOptions: {
    reportUnusedDisableDirectives: "error",
    reportUnusedInlineConfigs: "error",
  },
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2021,
      ...globals.serviceworker,
    },
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: strictRules,
};

export default tseslint.config(globalIgnores(ignores), typeScriptConfig, {
  files: ["**/*.{spec,test}.{ts,tsx}"],
  extends: [vitest.configs.recommended],
  rules: {
    "@typescript-eslint/await-thenable": "warn",
  },
});
