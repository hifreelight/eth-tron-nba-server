'use strict';
module.exports = {
  mongoDb: {
    connector: 'mongodb',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 27017,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME || 'rand',
    authSource: 'admin',
  },
};
