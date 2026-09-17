import js from "@eslint/js";
import tseslint from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".firebase/**",
      "test-results/**",
      "playwright-report/**",
      "submission/**",
      "postcss.config.mjs",
    ],
  },
  {
    files: [
      "app/**/*.{ts,tsx}",
      "lib/**/*.ts",
      "tests/**/*.ts",
      "scripts/verify-data.ts",
    ],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: { "react-hooks": hooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);
