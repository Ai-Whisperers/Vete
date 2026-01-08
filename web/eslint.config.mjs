import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Base JavaScript rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // React configuration
  {
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Console usage - warn to help identify places to migrate to logger
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Pre-existing technical debt - downgrade to warnings
      "@typescript-eslint/no-unused-expressions": "warn",
      "no-undef": "off", // TypeScript handles undefined references
      "no-prototype-builtins": "warn",
      "no-empty": "warn",
      "no-fallthrough": "warn",
      "no-control-regex": "warn",
      "no-cond-assign": "warn",
      "no-func-assign": "warn",
      "@typescript-eslint/no-this-alias": "warn",

      // TypeScript - downgrade to warnings for pre-existing issues
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/ban-ts-comment": "warn",

      // General - downgrade some rules to warnings
      "no-useless-escape": "warn",
      "prefer-const": "warn",
      "no-case-declarations": "warn",

      // React
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/prop-types": "off", // Using TypeScript
      "react/jsx-no-target-blank": "warn",
      "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],

      // React Hooks
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",

      // Next.js
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "warn",

      // General best practices
      "no-debugger": "warn",
      "no-alert": "warn",
      "no-var": "warn",
      "no-constant-condition": "warn",
      "no-misleading-character-class": "warn",
      "no-unsafe-finally": "warn",
      "no-unreachable": "warn",
      "no-self-assign": "warn",
      "no-const-assign": "warn",
      "no-constant-binary-expression": "warn",
      "no-empty-pattern": "warn",
      "no-unsafe-optional-chaining": "warn",
      "no-async-promise-executor": "warn",
      "no-redeclare": "warn",
      "valid-typeof": "warn",
      "getter-return": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn",

      // Disable rules that may be referenced in bundled code but aren't installed
      // These rules don't exist in our config but may be referenced in eslint-disable comments

      "eqeqeq": ["warn", "always", { null: "ignore" }],
    },
  },

  // Ignore patterns
  {
    ignores: [
      "_archive/**",
      "storybook-static/**",
      "**/chunks/**",
      "node_modules/**",
      ".next/**",
      "out/**",
      "coverage/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "scripts/**",
      "db/**",
      "supabase/**",
    ],
  },
];
