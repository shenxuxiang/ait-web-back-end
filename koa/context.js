const Stream = require('stream');
const statuses = require('statuses');
const delegate = require('./delegate');
const createError = require('../http-error');
const Cookies = require('../cookies');

const context = {
  throw(...args) {
    throw createError(...args);
  },
  onerror(err) {
    if (!err) return;
    this.app.emit('error', err);

    let status = err.status || err.statusCode;
    if (err.code === 'ENOENT') status = 404;

    if (typeof status !== 'number' || !statuses(status)) status = 500;

    this.res.getHeaderNames().forEach((key) => this.res.removeHeader(key));

    // 当 expose 为真的时候使用 message。
    const msg = err.expose ? err.message : statuses(status);
    this.status = status;
    this.type = 'text/plain';
    this.length = Buffer.byteLength(msg);
    this.res.end(msg);
  },
  get cookies() {
    if (this._cookies) return this.cookies;
    return new Cookies(this.req, this.res);
  },
  set cookies(cookies) {
    this._cookies = cookies;
  },
};

delegate(context, 'response')
  .method('redirect')
  .method('get')
  .method('set')
  .method('has')
  .method('remove')
  .access('body')
  .access('length')
  .access('type')
  .access('status')
  .access('message')
  .method('vary')
  .method('attachment');

delegate(context, 'request')
  .method('get')
  .getter('url')
  .getter('URL')
  .getter('method')
  .getter('pathname')
  .getter('path')
  .getter('query')
  .getter('querystring')
  .getter('host')
  .getter('protocol')
  .getter('ip')
  .getter('port')
  .getter('origin')
  .getter('href');

module.exports = context;
