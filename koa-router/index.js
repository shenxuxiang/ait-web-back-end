const compose = require('../koa-compose');
const Layer = require('./layer');
const methods = ['post', 'get', 'head', 'delete', 'put'];
function Router(options) {
  if (!(this instanceof Router)) return new Router(options);

  this.opts = options || {};
  this.stack = [];
}

methods.forEach(function (method) {
  Router.prototype[method] = function () {
    const path = [].slice.call(arguments, 0, 1);
    const middlewares = [].slice.call(arguments, 1);
    this.register(path, [method], middlewares);
    return this;
  };
});

Router.prototype.register = function (path, methods, middlewares) {
  if (Array.isArray(path)) {
    for (let i = 0; i < path.length; i++) {
      this.register(path[i], methods, middlewares);
    }
    return;
  }

  const layer = new Layer(path, methods, middlewares);
  if (this.opts.prefix) layer.setPrefix(this.opts.prefix);
  this.stack.push(layer);
};

Router.prototype.use = function () {
  if (Array.isArray(arguments[0]) && typeof arguments[0][0] === 'string') {
    const paths = [].slice.call(arguments, 0, 1);
    const middlewares = [].slice.call(arguments, 1);
    for (let i = 0; i < paths.length; i++) {
      this.use.apply(this, [paths[i]].concat(middlewares));
    }
    return this;
  }

  const path = typeof arguments[0] === 'string' ? [].shift.call(arguments) : '';
  const middlewares = [].slice.call(arguments, 0);
  for (let i = 0; i < middlewares.length; i++) {
    const m = middlewares[i];
    if (m.router) {
      const cloneRouter = Object.assign(Object.create(Router.prototype), m.router);
      for (let j = 0; j < cloneRouter.stack.length; j++) {
        const nestedLayer = Object.assign(Object.create(Layer.prototype), cloneRouter.stack[j]);
        if (path) nestedLayer.setPrefix(path);
        if (this.opts.prefix) nestedLayer.setPrefix(this.opts.prefix);
        this.stack.push(nestedLayer);
      }
    } else {
      this.register(path || '/([^?#]*)', [], m);
    }
  }
  return this;
};

Router.prototype.match = function (pathname, method) {
  const matched = {
    path: [],
    pathAndMethod: [],
    route: false,
  };

  const stack = this.stack;
  for (let i = 0; i < stack.length; i++) {
    const layer = stack[i];
    if (layer.match(pathname)) {
      matched.path.push(layer);
      if (layer.methods.length === 0 || layer.methods.includes(method)) {
        matched.pathAndMethod.push(layer);
        if (layer.methods.length > 0) matched.route = true;
      }
    }
  }
  return matched;
};

Router.prototype.routes = function () {
  const router = this;
  dispatch.router = router;
  return dispatch;
  function dispatch(ctx, next) {
    const { pathname, method } = ctx;
    const matched = router.match(pathname, method);
    if (router.matched) {
      router.matched = router.matched.concat(matched.path);
    } else {
      router.matched = matched.path;
    }

    if (matched.route === false) return next();

    const nestedLayer = matched.pathAndMethod;
    const chain = nestedLayer.reduce(function (memo, layer) {
      memo.push(function (ctx, next) {
        ctx.params = layer.params(ctx.pathname);
        ctx.captures = layer.captures(ctx.pathname);
        return next();
      });

      return memo.concat(layer.stack);
    }, []);
    return compose(chain)(ctx, next);
  }
};

Router.prototype.all = function () {
  const path = arguments[0];
  const middlewares = [].slice.call(arguments, 1);
  this.register(path, methods, middlewares);
  return this;
};

Router.prototype.redirect = function (path, distination, code) {
  this.all(path, (ctx) => {
    ctx.status = code || 301;
    ctx.redirect(distination);
  });
  return this;
};

Router.prototype.prefix = function (prefix) {
  const stack = this.stack;
  for (let i = 0; i < stack.length; i++) {
    const layer = stack[i];
    layer.setPrefix(pefix);
  }
  this.opts.prefix = prefix;
};

module.exports = Router;
