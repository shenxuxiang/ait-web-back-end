const multer = require('@koa/multer');
const path = require('path');
const fs = require('fs');

// 判断文件、目录是否存在
function existing(dir) {
  try {
    fs.accessSync(dir, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = function (dir) {
  const destination = path.isAbsolute(dir) ? dir : path.resolve(dir);
  const storage = multer.diskStorage({
    destination(req, file, cb) {
      // 如果目录不存在，则创建一个目录。
      if (!existing(destination)) fs.mkdirSync(destination);

      cb(null, destination);
    },
    filename(req, file, cb) {
      let filename = file.originalname;
      const extname = path.extname(filename);
      const basename = path.basename(filename, extname);
      filename = `${basename}.${Math.random().toString(32).slice(2)}${extname}`;

      cb(null, filename);
    },
  });
  return multer({ storage });
};
