function Cookies(req, res) {
  if (!(this instanceof Cookies)) return new Cookies(req, res);

  this.req = req;
  this.res = res;
}

Cookies.prototype.get = function (name) {
  const cookie = this.req.headers?.cookie || '';
  const reg = getPattern(name);
  const matched = reg.exec(cookie);
  if (matched == null) return null;
  return matched[1];
};

Cookies.prototype.set = function (name, value, attr) {
  const cookies = this.res.getHeader('Set-Cookie') || [];
  const cookie = new Cookie(name, value, attr);
  let isRepeat = false;
  for (let i = 0; i < cookies.length; i++) {
    if (cookies[i].startsWith(cookie.name)) {
      cookies[i] = cookie.toHeader();
      isRepeat = true;
      break;
    }
  }
  if (!isRepeat) cookies.push(cookie.toHeader());

  this.res.setHeader('Set-Cookie', cookies);
};

function Cookie(name, value, attr) {
  if (!(this instanceof Cookie)) return new Cookies(name, value, attr);

  this.name = name;
  this.value = value;
  for (let key in attr) {
    if (attr.hasOwnProperty(key)) this[key] = attr[key];
  }
}

Cookie.prototype.domain = undefined;
Cookie.prototype.path = '/';
Cookie.prototype.maxage = 0;
Cookie.prototype.expires = undefined;
Cookie.prototype.samesite = undefined;
Cookie.prototype.httponly = false;
Cookie.prototype.secure = false;

Cookie.prototype.toString = function () {
  return this.name + '=' + this.value;
};

Cookie.prototype.toHeader = function () {
  let cookie = this.toString();
  if (this.domain) cookie += `; domain=${this.domain}`;
  if (this.path) cookie += `; path=${this.path}`;
  if (this.maxage) this.expires = new Date(Date.now() + this.maxage);
  if (this.expires) cookie += `; expires=${this.expires.toUTCString()}`;
  if (this.samesite) cookie += `; sameSite=${this.samesite === true ? 'strict' : this.samesite.toLowerCase()}`;
  if (this.httponly) cookie += '; httponly';
  if (this.secure) cookie += '; secure';
  return cookie;
};

function getPattern(name) {
  let source = '(?:^|;\\s*)';
  source += name.replace(/[\[\](){}\\/|^$+-?#\s]/, '\\$&');
  source += '=([^;]+)';
  return new RegExp(source);
}

module.exports = Cookies;
