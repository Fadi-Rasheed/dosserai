import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const namedImportAndExportSelectors = [
  {
    selector: "ImportNamespaceSpecifier",
    message:
      'Use named imports instead of `import * as X`. Example: import { type ComponentProps } from "react".',
  },
  {
    selector:
      'ImportDeclaration[source.value="react"] > ImportDefaultSpecifier',
    message:
      'Use named imports from "react" instead of `import React from "react"`.',
  },
  {
    selector: "ExportNamedDeclaration[declaration=null][source=null]",
    message:
      "Export at the definition: `export const Label = () => {}` instead of `function Label()` plus `export { Label }`.",
  },
  {
    selector: "FunctionDeclaration[id.name=/^[A-Z]/]",
    message:
      "Define components as arrow functions: `export const Label = () => {}` instead of `function Label()`.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-syntax": ["error", ...namedImportAndExportSelectors],
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    ignores: [
      "app/**/page.tsx",
      "app/**/layout.tsx",
      "app/**/loading.tsx",
      "app/**/error.tsx",
      "app/**/global-error.tsx",
      "app/**/not-found.tsx",
      "app/**/forbidden.tsx",
      "app/**/unauthorized.tsx",
      "app/**/template.tsx",
      "app/**/default.tsx",
      "app/**/route.ts",
      "app/**/route.js",
      "app/manifest.ts",
      "proxy.ts",
      "instrumentation.ts",
      "next.config.ts",
      "postcss.config.mjs",
      "eslint.config.mjs",
      "tailwind.config.ts",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...namedImportAndExportSelectors,
        {
          selector: "ExportDefaultDeclaration",
          message:
            "Use a named export at the definition (`export const Label = () => {}`) instead of a default export. Next.js page/layout/route files are exempt.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
