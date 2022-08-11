const { pathToRegexp } = require('path-to-regexp');

function Layer(path, methods, middlewares, options) {
  if (!(this instanceof Layer)) return new Layer(path, methods, options);
  this.options = options || {};
  this.paramNames = [];
  this.path = path;
  this.regexp = pathToRegexp(path, this.paramNames, this.options);
  this.stack = Array.isArray(middlewares) ? middlewares : [middlewares];
  this.methods = [];
  for (let i = 0; i < methods.length; i++) {
    const method = methods[i].toUpperCase();
    this.methods.push(method);
    if (method === 'GET') this.methods.push('HEAD');
  }
}

Layer.prototype.match = function (pathname) {
  return this.regexp.test(pathname);
};

Layer.prototype.setPrefix = function (prefix) {
  if (this.path === '/' || !this.path) {
    this.path = prefix;
  } else {
    this.path = prefix + this.path;
  }
  this.paramNames = [];
  this.regexp = pathToRegexp(this.path, this.paramNames, this.options);
};

Layer.prototype.params = function (pathname) {
  const matched = this.regexp.exec(pathname);
  if (matched == null) return null;
  const value = matched.slice(1);
  return this.paramNames.reduce(function (memo, item, index) {
    memo[item.name] = value[index];
    return memo;
  }, {});
};

Layer.prototype.captures = function (pathname) {
  const matched = this.regexp.exec(pathname);
  if (matched == null) return null;
  return matched.slice(1) || [];
};

module.exports = Layer;
