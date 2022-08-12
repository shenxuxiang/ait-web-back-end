const path = require('path');
const fs = require('fs');
const Koa = require('../koa');
const fileSystem = require('../koa-static');
const router = require('./router');
const { ActiveInfoModel, CourseModel } = require('./mongodb');

const options = {
  cert: fs.readFileSync(path.resolve('./ssl/cert.pem')),
  key: fs.readFileSync(path.resolve('./ssl/cert.key')),
};

const app = new Koa({ ssl: true, ...options });
app.context.db = {
  ActiveInfoModel,
  CourseModel,
};

app.use(fileSystem(path.resolve('static')));
app.use(router.routes());

app.listen(443, () => {
  console.log('server start at port 443');
});
