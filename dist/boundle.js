'use strict';

var STATUS;
(function (STATUS) {
    STATUS[STATUS["pending"] = 0] = "pending";
    STATUS[STATUS["fulfilled"] = 1] = "fulfilled";
    STATUS[STATUS["rejected"] = 2] = "rejected";
})(STATUS || (STATUS = {}));
var MyPromise = /** @class */ (function () {
    function MyPromise(exector) {
        var _this = this;
        this.value = null;
        this.reason = null;
        this.status = STATUS.pending;
        this.onFulfilledCallbacks = [];
        this.onRejectCallbacks = [];
        this.resolve = function (value) {
            if (_this.status === STATUS.pending) {
                setTimeout(function () {
                    _this.value = value;
                    _this.status = STATUS.fulfilled;
                    _this.onFulfilledCallbacks.forEach(function (onFulfilled) { return onFulfilled(_this.value); });
                });
            }
        };
        this.reject = function (reason) {
            if (_this.status === STATUS.pending) {
                setTimeout(function () {
                    _this.reason = reason;
                    _this.status = STATUS.rejected;
                    _this.onRejectCallbacks.forEach(function (onReject) { return onReject(_this.reason); });
                });
            }
        };
        this.resolvePromise = function (promise2, x, resolve, reject) {
            if (x === promise2) {
                return reject(new TypeError('不能返回相同的引用'));
            }
            if (x instanceof MyPromise) {
                x.then(resolve, reject);
            }
            else if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
                var called_1 = false;
                try {
                    var then = x.then;
                    if (typeof then === 'function') {
                        then.call(x, function (y) {
                            if (called_1) {
                                return;
                            }
                            called_1 = true;
                            _this.resolvePromise(promise2, y, resolve, reject);
                        }, function (r) {
                            if (called_1) {
                                return;
                            }
                            called_1 = true;
                            reject(r);
                        });
                    }
                    else {
                        if (called_1) {
                            return;
                        }
                        called_1 = true;
                        resolve(x);
                    }
                }
                catch (e) {
                    if (called_1) {
                        return;
                    }
                    called_1 = true;
                    reject(e);
                }
            }
            else {
                resolve(x);
            }
        };
        exector(this.resolve, this.reject);
    }
    MyPromise.prototype.then = function (onFulfilled, onReject) {
        var _this = this;
        onFulfilled = onFulfilled && typeof onFulfilled === 'function' ? onFulfilled : function (value) { return value; };
        onReject = onReject && typeof onReject === 'function' ? onReject : function (reason) { throw reason; };
        var promise2 = new MyPromise(function (resolve, reject) {
            try {
                if (_this.status === STATUS.fulfilled) {
                    setTimeout(function () {
                        var x = onFulfilled === null || onFulfilled === void 0 ? void 0 : onFulfilled(_this.value);
                        _this.resolvePromise(promise2, x, resolve, reject);
                    });
                }
                if (_this.status === STATUS.rejected) {
                    setTimeout(function () {
                        var x = onReject === null || onReject === void 0 ? void 0 : onReject(_this.reason);
                        _this.resolvePromise(promise2, x, resolve, reject);
                    });
                }
                if (_this.status == STATUS.pending) {
                    _this.onFulfilledCallbacks.push(function () {
                        setTimeout(function () {
                            try {
                                var x = onFulfilled === null || onFulfilled === void 0 ? void 0 : onFulfilled(_this.value);
                                _this.resolvePromise(promise2, x, resolve, reject);
                            }
                            catch (e) {
                                reject(e);
                            }
                        });
                    });
                    _this.onRejectCallbacks.push(function () {
                        setTimeout(function () {
                            try {
                                var x = onReject === null || onReject === void 0 ? void 0 : onReject(_this.reason);
                                _this.resolvePromise(promise2, x, resolve, reject);
                            }
                            catch (e) {
                                reject(e);
                            }
                        });
                    });
                }
            }
            catch (e) {
                reject(e);
            }
        });
        return promise2;
    };
    return MyPromise;
}());
var p = new MyPromise(function (resolve, reject) {
    setTimeout(function () {
        resolve(1);
    });
}).then(function (value) {
    console.log('ok: ', value);
    return new MyPromise(function (resolve) {
        resolve('哈哈哈');
    });
}, function (reason) {
    console.log('error: ', reason);
    return reason + " --- fail";
});
p.then(function (value) {
    console.log('ok 2: ', value);
}, function (reason) {
    console.log('error 2: ', reason);
});
MyPromise.deferred = function () {
    var dfd = {};
    dfd.promise = new MyPromise(function (resolve, reject) {
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
};

module.exports = MyPromise