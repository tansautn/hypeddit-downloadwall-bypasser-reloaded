import js from '@eslint/js';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script', // UserScripts run as scripts, not ES modules
      globals: {
        // Browser globals
        ...globals.browser,

        // Tampermonkey / Greasemonkey GM4 APIs
        GM:                     'readonly',
        GM_info:                'readonly',
        GM_getValue:            'readonly',
        GM_setValue:            'readonly',
        GM_deleteValue:         'readonly',
        GM_listValues:          'readonly',
        GM_addValueChangeListener: 'readonly',
        GM_removeValueChangeListener: 'readonly',
        GM_getResourceText:     'readonly',
        GM_getResourceURL:      'readonly',
        GM_addStyle:            'readonly',
        GM_addElement:          'readonly',
        GM_log:                 'readonly',
        GM_openInTab:           'readonly',
        GM_registerMenuCommand: 'readonly',
        GM_unregisterMenuCommand: 'readonly',
        GM_xmlhttpRequest:      'readonly',
        GM_notification:        'readonly',
        GM_setClipboard:        'readonly',
        GM_download:            'readonly',
        GM_cookie:              'readonly',
        GM_webRequest:          'readonly',
        unsafeWindow:           'readonly',

        // Script-specific globals
        exportFunction:         'readonly',
        cloneInto:              'readonly',
      },
    },
    rules: {
      // Code quality
      'no-unused-vars':   ['warn', { argsIgnorePattern: '^_' }],
      'no-console':       'off',         // Userscripts rely heavily on console.*
      'no-undef':         'error',

      // Style (minimal friction for userscript dev)
      'semi':             ['error', 'always'],
      'quotes':           ['error', 'single', { avoidEscape: true }],
      'indent':           ['error', 2],
      'eqeqeq':           ['warn', 'always'],
      'no-var':           'error',
      'prefer-const':     'warn',
    },
  },
  {
    // Relaxed rules for the dev skeleton
    files: ['dev/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
];
