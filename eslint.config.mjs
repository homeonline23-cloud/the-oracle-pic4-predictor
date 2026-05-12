import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "next-env.d.ts",
      ".next/*",
      "out/*",
      "applet/**",
      "**/applet/**",
      "**/out/*",
      "**/_next/*",
      "app.js",
      "zip-out.js",
      "namecheap-upload.js",
      "build_and_zip.js",
      "create_zip2.js",
      "generate_tree2.js",
      "zip_node_app.js"
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
