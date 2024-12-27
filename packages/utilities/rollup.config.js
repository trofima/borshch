import terser from '@rollup/plugin-terser'
import pkg from './package.json' with {type: 'json'}

const external = [...Object.keys(pkg.peerDependencies ?? {}), ...Object.keys(pkg.dependencies ?? {})]

export default {
  input: './src/index.js',
  output: [
    {dir: './dist/cjs', format: 'cjs', exports: 'auto', preserveModules: true},
    {dir: './dist/es', format: 'es', preserveModules: true},
  ],
  plugins: [
    terser({keep_classnames: true}),
  ],
  external: external,
}
