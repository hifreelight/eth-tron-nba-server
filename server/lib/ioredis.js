'use strict';
const Redis = require('ioredis');

const config = {
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_IP || '127.0.0.1',
  password: process.env.REDIS_PWD || undefined,
};

module.exports = new Redis(config);
