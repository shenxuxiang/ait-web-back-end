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

module.exports = {
  getType,
  isArray,
  isSet,
  isMap,
  isPlainObject,
  isEmpty,
};
