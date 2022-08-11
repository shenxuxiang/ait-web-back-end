/**
 * request 对象中主要是定义获取一些和请求相关的信息
 * url
 * query
 * querystring
 * method
 * pathname
 * host
 * hostname
 * get(field)
 * header
 * ... 等等
 */
module.exports = {
  get header() {
    return this.req.headers;
  },
  get headers() {
    return this.req.headers;
  },
  get(field) {
    switch (field.toLowerCase()) {
      case 'referred':
      case 'referer':
        return this.header['referrer'] || this.header['referer'];
      default:
        return this.header[field.toLowerCase()];
    }
  },
  get pathname() {
    return this.URL.pathname;
  },
  get path() {
    return this.pathname;
  },
  get method() {
    return this.req.method;
  },
  get url() {
    return this.req.url;
  },
  get query() {
    const url = this.URL;
    const query = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    return query;
  },
  get querystring() {
    const searchIndex = this.url.indexOf('?');
    return searchIndex < 0 ? '' : this.url.slice(searchIndex);
  },
  get host() {
    return this.header.host;
  },
  get hostname() {
    const idx = this.host.indexOf(':');
    return idx > -1 ? this.host.slice(0, idx) : this.host;
  },
  get protocol() {
    return this.app.ssl ? 'https' : 'http';
  },
  get URL() {
    const origin = this.protocol + '://' + this.host;
    return new URL(this.url, origin);
  },
  get origin() {
    return this.protocol + '://' + this.host;
  },
  get href() {
    return this.origin + this.url;
  },
};
