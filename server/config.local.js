'use strict';

let redis = {
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_IP || '127.0.0.1',
  password: process.env.REDIS_PWD,
};

module.exports = {
  appName: 'rand',
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3005,
  redis: redis,
};
