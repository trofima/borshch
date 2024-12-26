import globals from 'globals'
import {commonEslintConfig} from '../../common-eslint.config.js'

export default [
  ...commonEslintConfig, {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    }
  }, {
    ignores: ['dist/*', 'deprecated/*'],
  },
]
