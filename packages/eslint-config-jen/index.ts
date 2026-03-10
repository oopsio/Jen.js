import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import type { Config } from "eslint/config";

/**
 * Comprehensive ESLint configuration for Jen.js projects
 * Supports: TypeScript, JavaScript, JSX, TSX
 * Targets: Node.js + Browser environments
 */
export default defineConfig([
  // Ignore patterns
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      ".turbo/",
      ".next/",
      "coverage/",
      "**/*.min.js",
      "**/*.d.ts",
      "*.config.js",
    ],
  },

  // JavaScript & TypeScript base rules
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Possible errors
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],
      "no-debugger": "error",
      "no-constant-condition": "warn",
      "no-unreachable": "error",
      "no-unused-vars": "off", // Handled by TypeScript ESLint
      "no-empty": [
        "error",
        {
          allowEmptyCatch: true,
        },
      ],

      // Best practices
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "no-throw-literal": "error",
      "no-implicit-coercion": "error",
      "no-multi-spaces": "error",
      "no-trailing-spaces": "error",
      "comma-dangle": ["error", "always-multiline"],
      semi: ["error", "always"],
      quotes: [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      indent: ["error", 2],
      "space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          named: "never",
          asyncArrow: "always",
        },
      ],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      eqeqeq: ["error", "always"],
      "no-duplicate-imports": "error",
      "no-self-compare": "error",
      "default-case-last": "error",
      "no-fallthrough": "error",

      // Code quality
      complexity: ["warn", 15],
      "max-depth": ["warn", 4],
      "max-nested-callbacks": ["warn", 3],
      "max-params": ["warn", 5],
      "max-lines": [
        "warn",
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },

  // TypeScript recommended configs
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    ...tseslint.configs.recommended,
  },

  // TypeScript type-checked configs
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    ...tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: process.cwd(),
      },
    },
  },

  // TypeScript stylistic type-checked configs
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    ...tseslint.configs.stylisticTypeChecked,
  },

  // TypeScript-specific custom rules
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Type checking
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-types": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/strict-boolean-expressions": [
        "warn",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: true,
        },
      ],
      "@typescript-eslint/prefer-namespace-keyword": "error",
      "@typescript-eslint/no-namespace": [
        "error",
        {
          allowDeclarations: true,
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-shadow": [
        "error",
        {
          hoist: "all",
        },
      ],
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "enumMember",
          format: ["UPPER_CASE"],
        },
        {
          selector: "objectLiteralProperty",
          format: null, // Allow any format for object properties
        },
      ],
      "@typescript-eslint/member-ordering": [
        "warn",
        {
          default: [
            "public-static-field",
            "protected-static-field",
            "private-static-field",
            "public-static-method",
            "protected-static-method",
            "private-static-method",
            "public-instance-field",
            "protected-instance-field",
            "private-instance-field",
            "constructor",
            "public-instance-method",
            "protected-instance-method",
            "private-instance-method",
          ],
        },
      ],
      "@typescript-eslint/method-signature-style": "warn",
      "@typescript-eslint/no-unnecessary-type-constraint": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/prefer-for-of": "warn",
      "@typescript-eslint/no-duplicate-type-constituents": "error",
      "@typescript-eslint/no-invalid-void-type": "error",

      // Style consistency
      "@typescript-eslint/semi": ["error", "always"],
      "@typescript-eslint/comma-dangle": ["error", "always-multiline"],
      "@typescript-eslint/indent": "off", // Let TypeScript handle indentation
    },
  },

  // JSX/TSX specific rules
  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
  },

  // Test files
  {
    files: ["**/*.{test,spec}.{ts,tsx,js}"],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        vi: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "max-lines": "off",
    },
  },

  // Config files
  {
    files: [
      "**/jest.config.ts",
      "**/vitest.config.ts",
      "**/vite.config.ts",
      "**/*.config.ts",
      "**/*.config.js",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
] as Config[]);
