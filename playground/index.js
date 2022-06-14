import express from 'express'
import {fileURLToPath} from 'url'
import {dirname} from 'path'

process.chdir(dirname(fileURLToPath(import.meta.url)));

const app = express()

app.set('view engine', 'ejs')
app.set('views', './src/views')
app.use(express.static('src'))

app.get('/', (request, response) => response.render('index'))

app.listen(3000, () => console.log('Playground app started on port 3000'))