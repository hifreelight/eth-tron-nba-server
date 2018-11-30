'use strict';

let assert = require('assert');
let expect = require('expect');
process.env.DEBUG = 'rand:*';
process.env.NODE_ENV = 'test';

let debug = require('debug')('rand:test');
let moment = require('moment');
const fomoBookTron = require('../server/lib/betTownFomoBookTron');

const gameId = 1;
describe('A suite for fomoTron', function() {
  this.timeout(1000 * 30);
  it('test getPlayerID', function(done) {
    fomoBookTron.pIDxAddr_('TXAsg1x5Y6mnyx5Z3vsCRNRchMvKwJMUbs')
      .then(data => {
        console.log(data);
        done();
      })
      .catch(err => {
        console.error(err);
      });
  });
});
