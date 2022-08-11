const statuses = require('statuses');

module.exports = function () {
  let msg;
  let status = 500;
  let err;
  let props;

  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i];
    if (arg instanceof Error) {
      err = arg;
      status = err.status || err.statusCode || status;
      continue;
    }
    switch (typeof arg) {
      case 'number':
        status = arg;
        break;
      case 'string':
        msg = arg;
        break;
      default:
        props = arg;
    }
  }

  if (typeof status === 'number' && (status > 600 || status < 400)) {
    console.log('status must be between400 and 600');
  }

  // 如果 status 不是数值类型，或者 status 不是标准的 HTTP 状态码，则将 status 设置为 500。
  if (typeof status !== 'number' || !statuses(status)) status = 500;

  if (!err) err = new Error(msg || statuses(status));

  err.status = err.statusCode = status;
  // expose 表示暴露错误消息。当 4xx 的时候才会暴露消息。
  err.expose = status < 500;

  if (props && typeof props === 'object') {
    for (let key in props) {
      if (key !== 'status' && key !== 'statusCode') {
        err[key] = props[key];
      }
    }
  }
  return err;
};
