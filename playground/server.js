import express from 'express'
import {fileURLToPath} from 'url'
import {dirname} from 'path'
import {rollup} from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import ejs from 'rollup-plugin-ejs'
import chalk from 'chalk'
import data from './data.json' assert { type: "json" }

process.chdir(dirname(fileURLToPath(import.meta.url)))
const staticFilesRegExp = /.+\..+/

const app = express()

app.set('view engine', 'ejs')
app.set('views', './src/views')
app.use(express.static('.'))
app.use(async (request, __, next) => {
  if (!staticFilesRegExp.test(request.path)) {
    console.info(chalk.blue('\nbuilding client...'))

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
      console.error(chalk.red(`\nbuilding client failed because of\n${e}`))
      return next()
    }

    console.info(chalk.green('built client successfully'))
  }

  return next()
})

app.route('*').get((_, response) => response.render('index', {data}))

app.listen(3000, () => console.info(chalk.blue('Playground app started on port 3000')))
