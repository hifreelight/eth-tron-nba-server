'use strict';

let assert = require('assert');
let expect = require('expect');
process.env.DEBUG = 'rand:*';
process.env.NODE_ENV = 'test';
let debug = require('debug')('rand:test');
const zhibo = require('../server/lib/zhibo');

describe('A suite for zhibo', function() {
  it('test got', function() {
    zhibo.score()
      .then(data => {
        debug('data is %s', JSON.stringify(data.list));
      });
  });
});
