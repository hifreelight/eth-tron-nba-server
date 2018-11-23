'use strict';

let assert = require('assert');
let expect = require('expect');
process.env.DEBUG = 'rand:*';
process.env.NODE_ENV = 'test';
let debug = require('debug')('rand:test');
let moment = require('moment');
const fomoTron = require('../server/lib/betTownFomoTron');

const gameId = 2;
describe('A suite for fomoTron', function() {
  this.timeout(1000 * 30);
  let createGame = () => {
    fomoTron.createGame('ten', ['Rocket1', 'Rocket2', 'Rocket3', '4', '5',
      'Thund1', 'Thund2', 'Thund3', 'Thund4', 'Thund5'])
    .then(response => {
      console.log('test createGame response is %o', response);
      // console.log(fomo.web3.utils.hexToBytes(response.logs[0].data));
    })
    .catch(err => {
      console.error(err);
    });
  };
  let onGameCreated = (done) =>{
    fomoTron.onGameCreated()
      .then(response => {
        console.log(response);
      })
      .catch(err => {
        console.error(err);
      });
  };
  it('test onGameCreated', function() {
    onGameCreated();
  });
  it('test create', function() {
    createGame();
  });
  it('test activate', function(done) {
    let startTime = moment().unix();
    fomoTron.activate(gameId, startTime)
      .then(data => {
        done();
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test buy', function(done) {
    let value = fomoTron.tronWeb.toSun(10);
    let _teamEth = [value, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let comment = 'test';
    fomoTron.buysXid(gameId, _teamEth, 0, value)
      .then(data => {
        console.log(data);
        done();
      })
      .catch(err => {
        console.error(err);
        done();
      });
  });
  it('test close', function(done) {
    let closeTime = moment().unix() + 10;
    fomoTron.setCloseTime(gameId, closeTime)
      .then(data => {
        console.log(data);
        done();
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test settleGame', function(done) {
    let deadline = moment().unix() + 3600 * 36;
    let comment = '76er vs huo 102:100';
    fomoTron.settleGame(gameId, 0, comment, deadline)
      .then(data => {
        console.log(data);
        done();
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test game', function() {
    fomoTron.getGame(gameId)
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  });
});
