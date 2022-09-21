const http = require('http');
const https = require('https');
const EventEmit = require('events');
const fs = require('fs');
const path = require('path');
const statuses = require('statuses');
const compose = require('../koa-compose');
const context = require('./context');
const request = require('./request');
const response = require('./response');
const Stream = require('stream');

class Koa extends EventEmit {
  constructor(opts = {}) {
    super();
    // ssl 表示是否使用 https。
    this.ssl = opts.ssl;
    this.cert = opts.cert;
    this.key = opts.key;
    this.middlewares = [];
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }

  use(func) {
    if (typeof func !== 'function') throw new Error('the use() params must be a function');

    this.middlewares.push(func);
  }

  callback() {
    const funcs = compose(this.middlewares);
    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, funcs);
    };
    return handleRequest;
  }

  listen(...args) {
    if (this.listenerCount('error') === 0) this.on('error', this.onerror);

    let server = http.createServer(this.callback());
    if (this.ssl) {
      const options = {
        key: this.key,
        cert: this.cert,
      };
      server = https.createServer(options, this.callback());
    }
    server.listen(...args);
  }

  createContext(req, res) {
    const ctx = Object.create(this.context);
    const request = Object.create(this.request);
    const response = Object.create(this.response);
    request.response = response;
    response.request = request;
    request.ctx = response.ctx = ctx;
    ctx.request = request;
    ctx.response = response;
    ctx.app = request.app = response.app = this;
    ctx.req = request.req = response.req = req;
    ctx.res = request.res = response.res = res;
    return ctx;
  }

  handleRequest(ctx, funcs) {
    ctx.res.statusCode = 404;

    const handleResponse = () => respond(ctx);
    const handleError = (error) => ctx.onerror(error);

    return funcs(ctx).then(handleResponse).catch(handleError);
  }

  onerror(err) {
    if (!err) return;

    const status = err.status || err.statusCode;
    if (err.expose || status === 404) return;
    const msg = err.stack || err.toString();
    console.log('=================== log ======================');
    // 在每一行的开头都加上三个空格，这样可以和其他的日志输出有所区别。
    console.error(msg.replace(/^/gm, '   '));
    console.log('==============================================');
  }
}

function respond(ctx) {
  if (ctx.respond === false) return;

  // 如果 status 是 204、205、304
  if (statuses.empty[ctx.status]) {
    ctx.body = null;
    return ctx.res.end(null);
  }

  // 如果请求方法是 HEAD。则只返回响应头信息。
  if (ctx.method === 'HEAD') {
    // 响应还未发出，且 response header 中没有 Content-Length
    if (!ctx.res.headersSend && !ctx.response.has('Content-Length')) {
      const length = ctx.response.length;
      // 如果 length 是一个数值类型，则说明是需要返回 Content-Length 的。除非 body 是一个 Stream。
      if (typeof length === 'number') ctx.length = length;
    }
    return ctx.res.end(null);
  }

  // 如果 body 是 null。则说明此时 status 是 404。
  if (ctx.body == null) {
    // _explicitNullBody === true，表示是业务逻辑不需要返回任何内容。
    if (ctx.response._explicitNullBody) {
      ctx.remove('Content-Type');
      ctx.remove('Content-Length');
      return ctx.res.end();
    }
    const msg = statuses(ctx.status);
    ctx.type = 'text/plain';
    ctx.length = Buffer.byteLength(msg);
    return ctx.res.end(msg);
  }

  // 一下是正常处理逻辑
  const body = ctx.body;
  if (body instanceof Stream) return body.pipe(ctx.res);
  if (Buffer.isBuffer(body)) return ctx.res.end(body);
  if (typeof body === 'string') return ctx.res.end(body);
  return ctx.res.end(JSON.stringify(body));
}

module.exports = Koa;
