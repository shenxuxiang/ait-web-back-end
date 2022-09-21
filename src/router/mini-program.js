/**
 * 数据库操作失败，统一返回 status 200 code 4999
 * 请求参数为空，统一返回 status 200 code 9999
 * 请求参数获取失败，status 500
 */
const Router = require('../../koa-router');
const multer = require('../multer');
const { getRequestBody } = require('../../request-body');
const { isEmpty } = require('../utils');

const router = new Router();

// 请求活动信息
router.post('/mini-program/active-info', async (ctx) => {
  let doc;
  try {
    // $type: 4 表示数组类型
    // 查找表中有 about 字段的文档，且 about 是数组类型。
    doc = await ctx.db.ActiveInfoModel.findOne({ about: { $type: 4 } });
    ctx.body = { data: doc || {}, code: 0, msg: 'ok' };
  } catch (error) {
    ctx.body = { data: null, code: 4999, msg: '数据库操作失败' };
  }
});
// 修改活动信息
router.post('/mini-program/update/active-info', async (ctx) => {
  let body;
  try {
    body = await getRequestBody(ctx.req);
    if (isEmpty(body)) {
      ctx.body = { data: null, code: 9999, msg: '请求参数不能为空' };
      return;
    }
    if (!body._id) {
      ctx.body = { data: null, code: 9999, msg: '参数_id不能为空' };
      return;
    }
  } catch (error) {
    return ctx.throw(500);
  }

  try {
    await ctx.db.ActiveInfoModel.updateOne({ _id: body._id }, { $set: body });
    ctx.body = { data: true, code: 0, msg: 'ok' };
  } catch (error) {
    ctx.body = { data: null, code: 4999, msg: '数据库操作失败' };
  }
});
// 删除活动信息
router.post('/mini-program/delete/active-info', async (ctx) => {
  let body;
  try {
    body = await getRequestBody(ctx.req);
    if (isEmpty(body)) {
      ctx.body = { data: null, code: 9999, msg: '请求参数不能为空' };
      return;
    }
    if (!body._id) {
      ctx.body = { data: null, code: 9999, msg: '参数_id不能为空' };
      return;
    }
  } catch (error) {
    return ctx.throw(500);
  }

  try {
    await ctx.db.ActiveInfoModel.deleteOne({ _id: body._id });
    ctx.body = { data: true, code: 0, msg: 'ok' };
  } catch (error) {
    ctx.body = { data: null, code: 4999, msg: '数据库操作失败' };
  }
});
// 创建活动信息
router.post('/mini-program/create/active-info', async (ctx) => {
  let body;
  try {
    body = await getRequestBody(ctx.req);
    if (isEmpty(body)) {
      ctx.body = { data: null, code: 9999, msg: '请求参数不能为空' };
      return;
    }
  } catch (error) {
    return ctx.throw(500);
  }

  try {
    const model = new ctx.db.ActiveInfoModel(body);
    await model.save();
    ctx.body = { data: true, code: 0, msg: 'ok' };
  } catch (error) {
    ctx.body = { data: null, code: 4999, msg: '数据库操作失败' };
  }
});

// 请求课程大纲信息
// 请求参数 body.course 表示要获取哪个课程的课程大纲。
router.post('/mini-program/syllabus', async (ctx) => {
  let body = {};
  let doc;
  try {
    body = await getRequestBody(ctx.req);

    if (isEmpty(body)) {
      ctx.body = { data: null, code: 9999, msg: '请求参数不能为空' };
      return;
    }
    if (!body.course && !body._id) {
      ctx.body = { data: null, code: 9999, msg: '缺少必须参数' };
      return;
    }
  } catch (error) {
    return ctx.throw(500);
  }

  try {
    // 注意，对于查询数据的 field 字段，必须现在 Schema 中声明，否则查询数据为全部数据。
    // $or 表示条件或，course/_id 两者满足其中一个。
    doc = await ctx.db.CourseModel.findOne({ $or: [{ course: body.course }, { _id: body._id }] });
    ctx.body = { data: doc || {}, code: 0, msg: 'ok' };
  } catch (error) {
    ctx.body = { data: null, code: 4999, msg: '数据库操作失败' };
  }
});
// 修改课程大纲
router.post('/mini-program/update/syllabus', async (ctx) => {
  let body = {};
  try {
    body = await getRequestBody(ctx.req);

    if (isEmpty(body)) {
      ctx.body = { data: null, code: 9999, msg: '请求参数不能为空' };
      return;
    }
    if (!body._id && !body.course) {
      ctx.body = { data: null, code: 9999, msg: '缺少必须参数' };
      return;
    }
  } catch (error) {
    return ctx.throw(500);
  }

  try {
    // 注意，对于查询数据的 field 字段，必须现在 Schema 中声明，否则查询数据为全部数据。
    await ctx.db.CourseModel.updateOne({ $or: [{ _id: body._id }, { course: body.course }] }, { $set: body });
    ctx.body = { data: true, code: 0, msg: 'ok' };
  } catch (error) {
    ctx.body = { data: null, code: 4999, msg: '数据库操作失败' };
  }
});
// 删除课程大纲
router.post('/mini-program/delete/syllabus', async (ctx) => {
  let body = {};
  try {
    body = await getRequestBody(ctx.req);

    if (isEmpty(body)) {
      ctx.body = { data: null, code: 9999, msg: '请求参数不能为空' };
      return;
    }
    if (!body._id && !body.course) {
      ctx.body = { data: null, code: 9999, msg: '缺少必须参数' };
      return;
    }
  } catch (error) {
    return ctx.throw(500);
  }

  try {
    // 注意，对于查询数据的 field 字段，必须现在 Schema 中声明，否则查询数据为全部数据。
    await ctx.db.CourseModel.deleteOne({ $or: [{ _id: body._id }, { course: body.course }] });
    ctx.body = { data: true, code: 0, msg: 'ok' };
  } catch (error) {
    ctx.body = { data: null, code: 4999, msg: '数据库操作失败' };
  }
});
// 新增课程大纲
router.post('/mini-program/create/syllabus', async (ctx) => {
  let body = {};
  try {
    body = await getRequestBody(ctx.req);

    if (isEmpty(body)) {
      ctx.body = { data: null, code: 9999, msg: '请求参数不能为空' };
      return;
    }
  } catch (error) {
    ctx.body = { data: null, code: 9999, msg: '参数解析失败' };
    return;
  }

  try {
    // 注意，对于查询数据的 field 字段，必须现在 Schema 中声明，否则查询数据为全部数据。
    const model = new ctx.db.CourseModel(body);
    await model.save();
    ctx.body = { data: true, code: 0, msg: 'ok' };
  } catch (error) {
    ctx.body = { data: null, code: 4999, msg: '数据库操作失败' };
  }
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
