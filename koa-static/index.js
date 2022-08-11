const path = require('path');
const send = require('./send');

module.exports = function static(root, options) {
  if (!root) throw new Error('directory root is required for file system');
  const opts = Object.assign({}, options);
  if (path.isAbsolute(root)) {
    opts.root = root;
  } else {
    opts.root = path.resolve(root);
  }

  if (!opts.index) opts.index = './index.html';

  if (opts.defer) {
    return function (ctx, next) {
      const { pathname, method, status, body } = ctx;
      if (method !== 'GET' && method !== 'HEAD') return;
      if (status !== 404 || body !== null) return;

      try {
        send(ctx, pathname, opts);
      } catch (error) {
        // 如果 error 不是 404。则抛出异常。最终错误异常会冒泡到 Compose 函数中并被 try...catch 捕获。并最终交由 ctx.onerror() 处理
        // 如果是 404，则不进行处理。此时后面已经没有中间件函数了。所以最终返回 404。
        if (error.status !== 404) {
          throw error;
        }
      }
    };
  } else {
    return function (ctx, next) {
      let down = false;
      const { pathname, method } = ctx;

      if (method === 'GET' || method === 'HEAD') {
        try {
          send(ctx, pathname, opts);
          down = true;
        } catch (error) {
          // 如果 error 不是 404。则抛出异常。最终错误异常会冒泡到 Compose 函数中并被 try...catch 捕获。并最终交由 ctx.onerror() 处理
          // 如果是 404，则不进行处理。此后仍然会执行后面的中间件函数。如果没有对应的中间件函数进行处理，则最终返回 404。
          if (error.status !== 404) {
            throw error;
          }
        }
      }
      if (down === false) return next();
    };
  }
};
