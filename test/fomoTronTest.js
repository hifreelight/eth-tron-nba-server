'use strict';
require('dotenv').config();
let assert = require('assert');
let expect = require('expect');
process.env.DEBUG = 'rand:*';
// process.env.NODE_ENV = 'test';
process.env.NODE_ENV = 'production';

let debug = require('debug')('rand:test');
let moment = require('moment');
const fomoTron = require('../server/lib/betTownFomoTron');

const gameId = 18;
describe('A suite for fomoTron', function() {
  this.timeout(1000 * 60);
  let createGame = () => {
    fomoTron.createGame('ten', ['Rocket1', 'Rocket2', 'Rocket3', '4', '5',
      'Thund1', 'Thund2', 'Thund3', 'Thund4', 'Thund5'])
    .then(response => {
      console.log('test createGame response is %o', response);
      // console.log(fomo.web3.utils.hexToBytes(response.logs[0].data));
      return response;
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
  // before(function(done) {
  //   createGame()
  //     .then(response => {
  //       done();
  //     });
  // });
  it('test onGameCreated', function() {
    // onGameCreated();
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
    console.log(value);
    fomoTron.buysXid(gameId, _teamEth, value)
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
    fomoTron.settleGame(gameId, 3, comment, deadline)
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
  it('test getPlayerStatus', function() {
    let pid = 1;
    fomoTron.getPlayerStatus(gameId, pid)
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test getGameStatus', function() {
    fomoTron.getGameStatus(gameId)
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test status', function() {
    fomoTron.getGameStatus(gameId)
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  });
});
