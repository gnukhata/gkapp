import globals from "globals";
import pluginVue from 'eslint-plugin-vue';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  js.configs.recommended,
  ...pluginVue.configs['flat/base'],
  ...pluginVue.configs['flat/vue2-essential'],
  ...pluginVue.configs['flat/vue2-strongly-recommended'],
  {
    files: ['**/*.vue', '**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-text-v-html-on-component': 'warn',
    },
  },
]);
