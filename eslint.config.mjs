import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "next-env.d.ts", ".data/**"],
  },
  {
    rules: {
      // All images on this site are static SVG illustrations – next/image
      // does not optimize SVGs, so plain <img> is the right tool here.
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
