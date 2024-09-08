import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
    { files: ['**/*.{js,mjs,cjs}'] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    eslintPluginPrettierRecommended,
];
