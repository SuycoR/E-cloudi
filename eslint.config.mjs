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
    rules: {
      // Disable no-explicit-any for API routes and complex types
      "@typescript-eslint/no-explicit-any": "warn",
      // Disable img element warning (we use <img> for dynamic S3 images)
      "@next/next/no-img-element": "off",
      // Disable exhaustive-deps for complex useEffect hooks
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
