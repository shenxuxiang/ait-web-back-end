const { Schema, connect, model } = require('mongoose');

const schemaActiveInfo = new Schema({
  about: Array,
  address: Object,
  advantages: Array,
  banners: Array,
  characteristic: Array,
  courses: Array,
  industryPrice: Array,
  teacherInfo: Object,
  signUpCutOffTime: Number,
  friendlyTips: String,
  shareInfo: Object,
  contact: Object,
});

const schemaCourse = new Schema({
  course: String,
  title: String,
  introduce: String,
  modules: Object,
});

const ActiveInfoModel = model('activeinfos', schemaActiveInfo);
const CourseModel = model('courses', schemaCourse);

connect('mongodb://127.0.0.1:27017/ait-mini-program')
  .then(() => console.log('数据库连接成功'))
  .catch(() => console.log('数据库连接失败'));

module.exports = {
  ActiveInfoModel,
  CourseModel,
};
