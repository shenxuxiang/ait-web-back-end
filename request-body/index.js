// 获取请求数据
module.exports = function () {
  return async function (ctx, next) {
    if (ctx.method !== 'POST') return next();

    try {
      ctx.requestBody = await getRequestBody(ctx.req);
    } catch (error) {}
    await next();
  }
}

module.exports.getRequestBody = function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', function(chunk) {
      chunks.push(chunk);
    });

    req.on('end', function() {
      const buf = Buffer.concat(chunks);
      return resolve(JSON.parse(buf.toString() || '{}'));
    });

    req.on('error', function(err) {
      return reject(err);
    });
  });
}
