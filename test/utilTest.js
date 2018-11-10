'use strict';

let request = require('supertest');
let should = require('should');
let moment = require('moment');
const util = require('../server/lib/util');

describe('dateUtils', function() {
  before(function(done) {
    done();
  });
  it('test findIndex', function(done) {
    let range = [1, 5, 8, 12, 18, 100];
    console.log(util.findIndex(18, range));
    done();
  });
  it('test args', function(done) {
    let fun = (f, ...args) => {
      console.log('%s, %o', f, ...args);
    };
    fun('test', 3, 4);
    done();
  });
});

