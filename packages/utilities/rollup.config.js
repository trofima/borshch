import terser from '@rollup/plugin-terser'
import pkg from './package.json' with {type: 'json'}

const external = [...Object.keys(pkg.peerDependencies ?? {}), ...Object.keys(pkg.dependencies ?? {})]

export default {
  input: './src/index.js',
  output: [
    {file: pkg.exports.require.default, format: 'cjs', exports: 'auto'},
    {file: pkg.exports.import.default, format: 'es'},
  ],
  plugins: [
    terser({keep_classnames: true}),
  ],
  external: external,
}
