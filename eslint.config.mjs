import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
  }),
  eslintConfigPrettier,
);
