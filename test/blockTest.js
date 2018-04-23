'use strict';

let assert = require('assert');
let expect = require('expect');
process.env.DEBUG = 'rand:*';
process.env.NODE_ENV = 'test';
let debug = require('debug')('rand:test');
let app = require('../server/server');

describe('A suite for block', function() {
  it('test updateAll', function() {
    app.models.Block.updateAll({}, {used: false})
      .then(function(data) {
        debug('data %O', data);
      });
  });
  it('test time', function() {
    let now = new Date().getTime();
    debug('now is %s', now);
    app.models.Block.find({where: {used: false, time: {lt: now - 1000 * 60 * 10}}, order: 'number DESC', limit: 2}, function(err, data) {
      debug('blocks : %O', data);
    });
  });
});
