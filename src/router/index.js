const Router = require('../../koa-router');
const multer = require('../multer');
const { getRequestBody } = require('../../request-body');

const router = new Router();

// 请求活动信息
router.post('/mini-program/active-info', async (ctx) => {
  let doc;
  try {
    doc = await ctx.db.ActiveInfoModel.findOne();
  } catch (error) {
    ctx.body = { data: null, code: 9999, msg: '数据库操作失败' };
    return;
  }

  ctx.body = { data: doc || {}, code: 0, msg: 'ok' };
});

// 请求课程大纲信息
// 请求参数 body.course 表示要获取哪个课程的课程大纲。
router.post('/mini-program/syllabus', async (ctx) => {
  let body = {};
  try {
    body = await getRequestBody(ctx.req);
  } catch (error) {
    return ctx.throw(500);
  }
  // 请求参数不合法
  if (!body?.course) {
    ctx.body = { data: null, code: 9999, msg: '请求参数不合法' };
    return;
  }

  let doc;
  try {
    // 注意，对于查询数据的 field 字段，必须现在 Schema 中声明，否则查询数据为全部数据。
    doc = await ctx.db.CourseModel.findOne({ course: body.course });
  } catch (error) {
    ctx.body = { data: null, code: 9999, msg: '数据库操作失败' };
    return;
  }

  ctx.body = { data: doc || {}, code: 0, msg: 'ok' };
});

router.post('/mini-prograp/upload/images', multer('static/mini-program/images').any(), (ctx) => {
  const { filename } = ctx.request.files[0];
  ctx.body = {
    data: true,
    url: `${ctx.origin}/mini-program/images/${filename}`,
    code: 0,
    msg: 'file upload success',
  };
});

module.exports = router;
