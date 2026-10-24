import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.svelte'],

    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },
  {
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  },
  {
    // svelte/no-navigation-without-resolve only applies to server-side navigation,
    // where goto() must be paired with resolve(). Disable it for client-side code.
    files: ['**/*.ts', '**/*.svelte'],
    rules: {
      'svelte/no-navigation-without-resolve': 'off'
    }
  },
  {
    files: ['**/+page.server.ts', '**/+server.ts', '**/hooks.server.ts'],
    rules: {
      'svelte/no-navigation-without-resolve': 'error'
    }
  },
  {
    ignores: ['build/', '.svelte-kit/', 'dist/', '.vercel/']
  }
);
