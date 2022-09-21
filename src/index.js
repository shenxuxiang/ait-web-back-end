const path = require('path');
const fs = require('fs');
const Koa = require('../koa');
const Router = require('../koa-router');
const fileSystem = require('../koa-static');
const miniRouter = require('./router/mini-program');
const centerRouter = require('./router/center');
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
const router = new Router();
router.use(miniRouter.routes(), centerRouter.routes());
app.use(fileSystem(path.resolve('static')));
app.use(router.routes());

app.listen(443, () => {
  console.log('server start at port 443');
});
