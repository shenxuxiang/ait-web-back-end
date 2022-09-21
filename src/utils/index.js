function getType(data) {
  return Object.prototype.toString.call(data).slice(8, -1);
}

function isArray(data) {
  return getType(data) === 'Array';
}

function isSet(data) {
  return getType(data) === 'Set';
}

function isMap(data) {
  return getType(data) === 'Map';
}

function isPlainObject(data) {
  if (typeof data !== 'object' || data === null) return false;
  const proto = Object.getPrototypeOf(data);
  let prototype = proto;

  if (proto === null) return true;
  while (Object.getPrototypeOf(prototype)) {
    prototype = Object.getPrototypeOf(prototype);
  }

  return prototype === proto;
}

function isEmpty(data) {
  if (!data) return true;
  if (isArray(data)) return data.length <= 0;
  if (isPlainObject(data)) return Object.keys(data).length <= 0;
  if (isSet(data) || isMap(data)) return data.size <= 0;
  return false;
}
// 返回 true 表示验证通过，否则验证失败并返回失败信息。
function paramsValidate(query, schema) {
  const body = query || {};
  const keys = Object.keys(schema);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    // isRequired 表示参数是否比传
    // type 表示参数类型
    const { isRequired, type } = schema[key];
    const data = body[key];
    if (isRequired) {
      if (!data) return { data: null, code: 9999, msg: `参数${key}不能为空` };
      // eslint-disable-next-line
      if (typeof data !== type) return { data: null, code: 9999, msg: `参数${key}类型错误` };
    } else {
      // eslint-disable-next-line
      if (data && typeof data !== type) return { data: null, code: 9999, msg: `参数${key}类型错误` };
    }
  }
  return true;
}
module.exports = {
  getType,
  isArray,
  isSet,
  isMap,
  isPlainObject,
  isEmpty,
  paramsValidate,
};
