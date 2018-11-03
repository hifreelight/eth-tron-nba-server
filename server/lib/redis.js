'use strict';
const config = require('../config.local');
const redisConfig = config['redis'];

'use strict';
const redis = require('redis');

function createRedisClient() {
  let ip = process.env.REDIS_IP || '127.0.0.1';
  let port = process.env.REDIS_PORT || '6379';
  let pwd = process.env.REDIS_PWD || '';
  let opts = pwd ? { password: pwd } : null;
  return redis.createClient(port, ip, opts);
}

const globalRedis = createRedisClient();
const { promisify } = require('util');

const lock = promisify(require('redis-lock')(globalRedis));

module.exports = {
  createRedisClient,
  globalRedis,
  lock,
};

