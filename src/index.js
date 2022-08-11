const path = require('path');
const Koa = require('../koa');
const fileSystem = require('../koa-static');
const router = require('./router');
const { ActiveInfoModel, CourseModel } = require('./mongodb');

const app = new Koa();
app.context.db = {
  ActiveInfoModel,
  CourseModel,
};

app.use(fileSystem(path.resolve('static')));
app.use(router.routes());

app.listen(3000, () => {
  console.log('server start at port 3000');
});
