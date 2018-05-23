'use strict';

const ds = require('./datasources.production.js');
console.log('datasources-dev' + JSON.stringify(ds));
module.exports = ds;
