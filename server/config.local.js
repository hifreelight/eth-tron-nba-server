'use strict';

let redis = {
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_IP || '127.0.0.1',
  password: process.env.REDIS_PWD,
};
let whiteList = process.env.WHITE_LIST || '127.0.0.1,221.217.90.174';
module.exports = {
  appName: 'rand',
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 2005,
  redis: redis,
  whiteList,
};
