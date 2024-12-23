import globals from 'globals'
import pluginJs from '@eslint/js'

export default [
  pluginJs.configs.recommended, {
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.mocha,
    },
  },
  rules: {
    'quotes': ['warn', 'single'],
    'semi': ['warn', 'never'],
    'no-trailing-spaces': ['warn'],
    'no-unused-vars': ['warn']
  },
}]
