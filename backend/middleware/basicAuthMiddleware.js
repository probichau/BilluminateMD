/**
 * HTTP Basic Auth Middleware
 * Only enabled for staging environment
 */

export function basicAuthMiddleware(req, res, next) {
  // Only apply to staging
  if (process.env.NODE_ENV !== 'staging') {
    return next()
  }

  // Skip auth for health checks (allow load balancer to check health)
  if (req.path === '/health') {
    return next()
  }

  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Staging Environment"')
    return res.status(401).json({
      error: 'Authentication required',
      message: 'This is a staging environment. Please provide credentials.',
    })
  }

  try {
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
    const [username, password] = credentials.split(':')

    // Check credentials
    const validUsername = process.env.BASIC_AUTH_USERNAME || 'billuminate'
    const validPassword = process.env.BASIC_AUTH_PASSWORD || 'staging2026!'

    if (username === validUsername && password === validPassword) {
      return next()
    } else {
      res.setHeader('WWW-Authenticate', 'Basic realm="Staging Environment"')
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password incorrect',
      })
    }
  } catch (error) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Staging Environment"')
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid credentials format',
    })
  }
}
