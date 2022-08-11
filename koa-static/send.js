const fs = require('fs');
const path = require('path');

function existing(filename) {
  try {
    fs.accessSync(filename, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = function send(ctx, pathname, opts) {
  const maxage = opts.magAge || opts.maxage;
  const gzip = opts.gzip !== false;
  const root = opts.root;
  const index = opts.index;
  const setHeaders = opts.setHeaders;
  let encodingExtName = '';
  let filename = path.join(root, pathname);
  if (gzip && ctx.get('Accept-Encoding')?.includes('gzip') && existing(filename + '.gz')) {
    filename += '.gz';
    encodingExtName = '.gz';
    ctx.remove('Content-Length');
    ctx.set('Content-Encoding', 'gzip');
  }

  let stats;

  try {
    stats = fs.statSync(filename);
    if (stats.isDirectory()) {
      filename = path.join(filename, index);
      stats = fs.statSync(filename);
    }
  } catch (error) {
    const notFound = ['ENOENT', 'ENOTDIR', 'ENAMETOOLONG'];
    if (notFound.includes(error.code)) ctx.throw(error, 404);
    error.status = 500;
    throw error;
  }

  if (setHeaders && typeof setHeaders !== 'function') throw new Error('setHeaders() must be a function');

  setHeaders && setHeaders(ctx.res, filename, stats);

  if (!ctx.has('Content-Type'))
    ctx.type = encodingExtName ? path.extname(path.basename(filename, encodingExtName)) : path.extname(filename);
  if (!ctx.has('Cache-Control')) ctx.set('Cache-Control', `max-age=${(maxage / 1000) | 0}`);
  if (!ctx.has('Last-Modified')) ctx.set('Last-Modified', stats.mtime.toUTCString());
  ctx.body = fs.createReadStream(filename);
};
