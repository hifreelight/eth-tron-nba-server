'use strict';
function error(message, status, code) {
  let err = new Error(message);
  err.statusCode = err.status = status || 400;
  err.code = code || 'UNKNOWN';
  return err;
}

function defaultSystemError() {
  let err = new Error('系统错误');
  err.statusCode = 400;
  err.code = 500;
  return err;
}

function getUnixTime() {
  return Math.floor(Date.now() / 1000);
}

function strip(num, precision = 12) {
  // fix js float calculation: https://github.com/camsong/blog/issues/9
  return +parseFloat(num.toPrecision(precision));
}

function msg(msg, lang) {
  try {
    let text = require('../config/i18n/' + lang);
    return text[msg] ? text[msg] : msg;
  } catch (err) {
    return msg;
  }
}
function findMaxRepeatNum(a) {
  let result = [0, 0];
  for (let i = 0; i < a.length; i++) {
    let count = 0;
    for (let j = 0; j < a.length; j++) {
      if (a[i] == a[j]) {
        ++count;
      }
    }
    if (count > result[0]) {
      result[0] = count;
      result[1] = a[i];
    } else if (count == result[0] && result[1] < a[i]) {
      result[1] = a[i];
    }
  }
  return result;
}
Array.prototype.getMost = function() {
  let obj = this.reduce((p, n) =>(p[n]++ || (p[n] = 1), (p.max = p.max >= p[n] ? p.max : p[n]), (p.key = p.max > p[n] ? p.key : n), p), {});
  return obj;
};
function objMerge(obj, obj2) {
  if (typeof obj !== 'object' || typeof obj2 !== 'object') {
    return obj;
  }
  for (let i in obj2) {
    obj[i] = obj2[i];
  }
  return obj;
}
const findIndex = (val, arr) => (arr.findIndex((el) => el > val) - 1);

module.exports = {
  error,
  defaultSystemError,
  getUnixTime,
  msg,
  strip,
  findMaxRepeatNum,
  objMerge,
  findIndex,
};
