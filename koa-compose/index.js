module.exports = function (middlewares) {
  if (Object.prototype.toString.call(middlewares) !== '[object Array]')
    throw new TypeError('middlewares stack must be an array');
  for (const func of middlewares) {
    if (typeof func !== 'function') throw new TypeError('midleware must be a function');
  }

  return function (ctx, next) {
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      // 如果 i <= index 则说明，在一个中间件函数中多次调用了 next() 函数。这是不允许的。
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));

      index = i;
      let fn = middlewares[i];
      // 如果在最后一个中间件函数中使用了 next() 函数，则触发
      if (i >= middlewares.length) fn = next;
      if (!fn) return Promise.resolve();

      try {
        return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
      } catch (error) {
        return Promise.reject(error);
      }
    }
  };
};
