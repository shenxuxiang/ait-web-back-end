// 设置代理。
// 在 proto 对象上设置与 target 上同名的属性和方法。
function Delegate(proto, target) {
  if (!(this instanceof Delegate)) return new Delegate(proto, target);

  this.proto = proto;
  this.target = target;
}

Delegate.prototype.method = function (name) {
  const target = this.target;
  const proto = this.proto;
  proto[name] = function () {
    return this[target][name].apply(this[target], arguments);
  };
  return this;
};

Delegate.prototype.getter = function (name) {
  const target = this.target;
  const proto = this.proto;
  Object.defineProperty(proto, name, {
    enumerable: true,
    configurable: true,
    get: function () {
      return this[target][name];
    },
  });
  return this;
};

Delegate.prototype.setter = function (name) {
  const target = this.target;
  const proto = this.proto;
  Object.defineProperty(proto, name, {
    enumerable: true,
    configurable: true,
    set: function (value) {
      this[target][name] = value;
    },
  });
  return this;
};

Delegate.prototype.access = function (name) {
  const target = this.target;
  const proto = this.proto;
  Object.defineProperty(proto, name, {
    enumerable: true,
    configurable: true,
    get: function () {
      return this[target][name];
    },
    set: function (value) {
      this[target][name] = value;
    },
  });
  return this;
};

module.exports = Delegate;
