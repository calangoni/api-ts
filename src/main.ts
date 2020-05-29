import * as http from 'http'
import * as express from 'express'
import './extensions'
import apiRouter from './apiRouter'
import * as bodyParser from 'body-parser'

function createExpressApp () {
  const app = express()

  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', req.get('origin') || '*') // https://www.mydomain.com
    res.set('Access-Control-Allow-Methods', 'POST,GET')
    res.set('Access-Control-Allow-Headers', 'Content-Type, authorization')
    if (req.method === 'OPTIONS') return res.end()
    console.log(`${req.method}:${req.originalUrl}`)
    next()
  })

  app.get('/hello', (req, res) => res.send('hello world'))

  app.use(bodyParser.json())

  // API routes
  app.use(apiRouter)
  // app.use(function (req, res, next) {
  //   if (req.get('origin') === 'https://www.mydomain.com') apiRouter(req, res, next)
  //   else res.status(404).send('unknown origin: ' + req.get('origin'))
  // })

  // 404 Not found
  app.use((req, res) => res.status(404).send('Not found: ' + req.originalUrl))

  // Catch errors
  app.use(<express.ErrorRequestHandler>function (err, req, res, next) {
    if (err) {
      console.error(err.Status, err.message, err.debugInfo ? JSON.stringify(err.debugInfo) : '')
      console.error(err.stack)
      if (err.Status) res.status(err.Status).send(err.message)
      else res.status(500).send('Unhandled error!')
    } else {
      console.error(500, 'Unhandled error!')
      res.status(500).send('Unhandled error!')
    }
    try {
      if (req.body && req.body.password) req.body.password = '****'
      if (req.query && req.query.password) req.query.password = '****'
      const dbgPars = JSON.stringify({ param: req.param, query: req.query, body: req.body })
      console.log(dbgPars.substr(0, 1000))
    } catch (err) { console.error(err) }
  })

  return app
}


async function init () {
  // Do checkings

  const server = http.createServer()
  // const server = https.createServer({
  //   cert: fs.readFileSync(`/path/to/fullchain.pem`),
  //   key: fs.readFileSync(`/path/to/privkey.pem`),
  //   ca: fs.readFileSync(`/path/to/chain.mydomain.crt.pem`),
  //   requestCert: true,
  //   rejectUnauthorized: false,
  // })

  const httpHandler = createExpressApp()
  server.on('request', httpHandler)

  server.on('listening', () => { console.log('Listening') })
  server.listen(8080)
}

init().catch(console.error)
