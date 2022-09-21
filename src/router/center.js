/**
 * 数据库操作失败，统一返回 status 200 code 4999
 * 请求参数为空，统一返回 status 200 code 9999
 * 请求参数获取失败，status 500
 */
const Router = require('../../koa-router');
const { getRequestBody } = require('../../request-body');
const { paramsValidate } = require('../utils');
const multer = require('../multer');

const router = new Router();

router.post('/api/query/syllabus', async (ctx) => {
  let body;
  try {
    body = await getRequestBody(ctx.req);
    const schema = {
      course: { isRequired: false, type: 'string' },
      pageSize: { isRequired: true, type: 'number' },
      pageNum: { isRequired: true, type: 'number' },
    };
    const result = paramsValidate(body, schema);
    if (result && typeof result === 'object') {
      ctx.body = result;
      return;
    }
  } catch (error) {
    return ctx.throw(500);
  }
  const { pageSize, pageNum, course } = body;
  try {
    const skip = (pageNum - 1) * pageSize;
    const list = await ctx.db.CourseModel.find(course ? { course } : null)
      .skip(skip)
      .limit(pageSize);
    const total = await ctx.db.CourseModel.count(course ? { course } : null);
    ctx.body = {
      data: {
        list, pageNum, pageSize, total,
      },
      code: 0,
      msg: 'ok',
    };
  } catch (error) {
    ctx.body = { data: null, code: 4999, msg: '数据库操作失败' };
  }
});

// 获取活动信息
router.get('/api/query/activity-info', async (ctx) => {
  try {
    const data = await ctx.db.ActiveInfoModel.findOne({});
    ctx.body = { data, code: 0, msg: 'ok' };
  } catch (error) {
    ctx.body = { data: null, code: 4999, msg: '数据库操作失败' };
  }
});

router.post(
  '/api/upload/mini-program/images',
  multer('static/mini-program/images').single('file'),
  async (ctx) => {
    const { filename } = ctx.file;
    const origin = process.env.NODE_ENV === 'development' ? 'https://127.0.0.1' : 'https://aitweb.cn';

    ctx.body = {
      data: `${origin}/mini-program/images/${filename}`,
      code: 0,
      msg: 'ok',
    };
  },
);

module.exports = router;
