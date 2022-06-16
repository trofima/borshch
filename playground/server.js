import express from 'express'
import {fileURLToPath} from 'url'
import {dirname} from 'path'
import {rollup} from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import ejs from 'rollup-plugin-ejs'

process.chdir(dirname(fileURLToPath(import.meta.url)));

const app = express()

app.set('view engine', 'ejs')
app.set('views', './src/views')
app.use(express.static('.'))
app.use(async (_, __, next) => {
  console.info(`\nbuilding client:`)

  try {
    const bundle = await rollup({
      input: 'src/app/index.js',
      plugins: [nodeResolve(), ejs({loadStyles: true})],
    })

    await bundle.write({
      format: 'es',
      name: 'bundle',
      file: 'dist/bundle.js',
      sourcemap: true,
    })
  } catch (e) {
    throw new Error(`\nbuilding client failed:\n${e}`);
  }
  
  console.info(`built client successfully`);
  next();
})

app.route('*').get((_, response) => response.render('index', {initialData: {shalom: 'shalom'}}))

app.listen(3000, () => console.log('Playground app started on port 3000'))
