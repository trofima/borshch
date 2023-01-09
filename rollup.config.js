import nodeResolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import ejs from 'rollup-plugin-ejs'
import pkg from './package.json' assert {type: 'json'}

const external = [...Object.keys(pkg.peerDependencies ?? {}), ...Object.keys(pkg.dependencies ?? {})]

export default {
  input: 'src/index.js',
  output: [
    {file: pkg.exports.require, format: 'cjs', exports: 'auto'},
    {file: pkg.exports.import, format: 'es'},
  ],
  plugins: [
    nodeResolve(),
    ejs({inlineStyles: true}),
    terser({keep_classnames: true}),
  ],
  external: external,
}
