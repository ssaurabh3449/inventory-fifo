const basicAuth = require('basic-auth');

const USER = process.env.BASIC_AUTH_USER || 'admin';
const PASS = process.env.BASIC_AUTH_PASS || 'secret123';

function requireAuth(req, res, next) {
  const user = basicAuth(req);
  if (!user || user.name !== USER || user.pass !== PASS) {
    res.set('WWW-Authenticate', 'Basic realm="Inventory"');
    return res.status(401).send('Authentication required.');
  }
  next();
}

module.exports = requireAuth;
