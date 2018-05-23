'use strict';

const ds = require('./datasources.production.js');
console.log('datasources-staging' + JSON.stringify(ds));
module.exports = ds;
