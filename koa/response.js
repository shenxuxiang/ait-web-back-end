const Stream = require('stream');
const statuses = require('statuses');
/**
 * response 对象主要是定义处理 HTTP 响应相关的信息
 * get(field)
 * set(field, value)
 * has(field)
 * remove(field)
 * status
 * message
 * type
 * length
 * body
 * vary
 * attachment
 * ... 等等
 */
module.exports = {
  // return response header
  get(field) {
    return this.res.getHeader(field.toLowerCase());
  },
  set() {
    if (arguments.length === 1 && arguments[0] && typeof arguments[0] === 'object') {
      const props = arguments;
      for (let key in props) {
        if (props.hasOwnProperty(key)) {
          this.set(key, props[key]);
        }
      }
      return;
    } else if (arguments.length === 2 && typeof arguments[0] === 'string') {
      this.res.setHeader(arguments[0], arguments[1]);
      return;
    } else {
      throw new Error('set() params error');
    }
  },
  has(field) {
    return this.res.hasHeader(field.toLowerCase());
  },
  remove(field) {
    this.res.removeHeader(field);
  },
  get length() {
    const body = this.ctx.body;
    if (this.has('Content-Length')) return this.get('Content-Length');

    if (!body || body instanceof Stream) return undefined;
    if (Buffer.isBuffer(body)) return body.length;
    if (typeof body === 'string') return Buffer.byteLength(body);
    return Buffer.byteLength(JSON.stringify(body));
  },
  set length(length) {
    if (this.has('Transfer-Encoding')) return;
    this.set('Content-Length', length);
  },
  get type() {
    return this.get('Content-Type');
  },
  set type(value) {
    let type;
    if (/(html|css)$/i.test(value)) {
      type = `text/${RegExp.$1}; charset=utf-8`;
    } else if (/(js|javascript)$/i.test(value)) {
      type = 'text/javascript; charset=utf-8';
    } else if (/(jpg|jpeg|png|gif)$/i.test(value)) {
      type = `image/${RegExp.$1}`;
    } else if (/(woff2|woff|ttf|eot)/i.test(value)) {
      type = `font/${RegExp.$1}`;
    } else if (/json$/.test(value)) {
      type = 'application/json; charset=utf-8';
    } else {
      type = value || 'application/octet-stream';
    }
    this.set('Content-Type', type);
  },
  get status() {
    return this.res.statusCode;
  },
  set status(value) {
    this._explicitStatus = true;
    this.res.statusCode = value;
  },
  get message() {
    return this.res.statusMessage;
  },
  set message(value) {
    this.res.statusMessage = value;
  },
  // Vary 用于服务器返回给代理服务器，代理服务器可以根据 Vary 的值，对资源进行缓存。
  vary(value) {
    this.set('Vary', value);
  },
  // 用于文件下载，设置下载后的文件名。
  attachment(filename) {
    this.set('Content-Disposition', `attachment; filename=${filename}`);
  },
  get body() {
    return this._body;
  },
  set body(value) {
    this._body = value;
    if (value == null) {
      if (!statuses.empty[this.status]) this.status = 204;
      this._explicitNullBody = true;
      this.remove('Content-Length');
      this.remove('Content-Type');
      this.remove('Transfer-Encoding');
      return;
    }

    // _explicitStatus 表示 status 是否已经被设置。
    // 当业务逻辑中已经设置了 status，那么在这里就不能重复设置了。
    // 例如使用 ctx.redirect() 重定向。
    if (!this._explicitStatus) this.status = 200;

    const hasType = this.has('Content-Type');
    if (value instanceof Stream) {
      this.remove('Content-Length');
      if (!hasType) this.type = 'application/octet-stream';
    } else if (Buffer.isBuffer(value)) {
      this.length = value.length;
      if (!hasType) this.type = 'application/octet-stream';
    } else if (typeof value === 'string') {
      this.length = Buffer.byteLength(value);
      if (!hasType) this.type = value.search(/\<\/?[a-zA-Z0-9]+\>/) > -1 ? 'text/html' : 'text/plain';
    } else {
      this.length = Buffer.byteLength(JSON.stringify(value));
      if (!hasType) this.type = 'application/json';
    }
  },
  redirect(url, alt) {
    if (url === 'back') url = this.request.get('referrer') || alt || '/';
    this.set('Location', encodeURI(url));

    if (!statuses.redirect[this.status]) this.status = 302;

    if (this.request.get('accept').includes('text/html')) {
      this.type = 'text/html; charset=utf-8';
      this.body = `Redirecting to <a href="${url}">${url}</a>.`;
      return;
    }

    this.type = 'text/plain; charset=utf-8';
    this.body = `Redirecting to ${url}.`;
  },
};
