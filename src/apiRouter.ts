import * as express from 'express'
const router = express.Router()

interface SessionData {
  userId: string
}

interface Public_API {
  ['/login']?: (reqParams: { userId: string, password: string }) => Promise<{ token: string }>
}

interface Private_API {
  ['/my-info']?: (reqParams: {}, session: SessionData) => Promise<{ userId: string }>
}

const publicRoutes: Public_API = {}
const privateRoutes: Private_API = {}

publicRoutes['/login'] = async function (reqParams) {
  if (!reqParams.userId) throw Error("userId required").HttpStatus(400).DebugInfo(reqParams)
  if (!reqParams.password) throw Error("password required").HttpStatus(400).DebugInfo(reqParams)
  if ((reqParams.userId === 'user@domain') && (reqParams.password === 's3cre7@')) {
    return { token: '123456' }
  } else {
    throw Error("Invalid user/password").HttpStatus(401).DebugInfo(reqParams)
  }
}

privateRoutes['/my-info'] = async function (reqParams, session) {
  return { userId: session.userId }
}

// Add public routes
for (const [route, callback] of Object.entries(publicRoutes)) {
  const handlerFunction = asSafeRoute(callback)
  router.post(route, handlerFunction)
  router.get(route, handlerFunction)
}

// Authentication for the private routes
router.use(async function (req, res, next) {
  try {
    const authHeader = req.get('Authorization')
    if (!authHeader) { res.status(401).send('No Authorization header'); return }
    const authUserData = { userId: 'example' } // TODO: check authHeader
    if (authUserData) {
      (<any>req).session = authUserData
      next()
    } else {
      res.status(500).end('Auth error')
    }
  } catch (err) {
    console.log(err)
    res.status(401).send('Auth error')
  }
})

// Add private routes
for (const [route, callback] of Object.entries(privateRoutes)) {
  const handlerFunction = asSafeRoute(callback)
  router.post(route, handlerFunction)
  router.get(route, handlerFunction)
}

function asSafeRoute (handlerFunction: (reqParams: Object, session?: SessionData, qInfo?: unknown) => Promise<string|Object>) {
  return async function (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const response = await handlerFunction(Object.assign({}, req.query, req.body, req.params), (<any>req).session, { req, res, next })
      if (typeof response === 'object') {
        res.status(200).json(response)
      } else {
        res.status(200).send(response ? String(response) : '')
      }
    } catch (err) { next(err) }
  }
}

export default router
