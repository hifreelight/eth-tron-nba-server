'use strict';

let assert = require('assert');
let expect = require('expect');
process.env.DEBUG = 'rand:*';
process.env.NODE_ENV = 'test';
let debug = require('debug')('rand:test');
let fomo = require('../server/lib/betTownFomo');
let moment = require('moment');

describe('A suite for fomo', function() {
  it('test createGame', function() {
    fomo.createGame('ten', ['Rocket1', 'Rocket2', 'Rocket3', '4', '5',
      'Thund1', 'Thund2', 'Thund3', 'Thund4', 'Thund5'])
      .then(response => {
        console.log('test createGame response is %o', response);
        // console.log(fomo.web3.utils.hexToBytes(response.logs[0].data));
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test data', function() {
    let data = '0x000000000000000000000000000000000000000000000000000000005be2990a';
    data = '0x43484920312d3400000000000000000000000000000000000000000000000000';
    data = '0x4348492031382b00000000000000000000000000000000000000000000000000';
    // console.log(fomo.web3.utils.hexToNumberString(data));
    // console.log(fomo.web3.utils.hexToBytes(data));
    console.log(fomo.web3.utils.toAscii(data));
    // let SolidityCoder = require('web3/lib/solidity/coder.js');
    // let d = SolidityCoder.decodeParams(['string', 'uint'], log.data.replace('0x', ''));
    // let d = fomo._decodeEventABI({ data: '0x0' }); //event raw data
    // console.log(d);
  });
  it('test onGameCreated', function() {
    console.log('givenProvider is %o', fomo.web3.givenProvider);
    console.log('currentProvider is %o', fomo.web3.currentProvider);
    fomo.onGameCreated();
  });
  it('test getGameStatus', function() {
    fomo.getGameStatus(11)
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test game', function() {
    fomo.getGame(11)
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test activate', function() {
    let startTime = moment().unix();
    fomo.activate(1, startTime)
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test close', function() {
    let closeTime = moment().unix() + 10;
    fomo.setCloseTime(3, closeTime)
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test settleGame', function() {
    let deadline = moment().unix() + 3600 * 36;
    let comment = '76er vs huo 115:100';
    fomo.settleGame(3, 0, comment, deadline)
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test some settleGame', function() {
    let deadline = 1541865050;
    let comment = '76er vs 76er 80:98';
    fomo.settleGame(15, 1, comment, deadline)
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test buy', function() {
    let value = fomo.web3.utils.toWei('0.1', 'ether');
    let _gameID = 1;
    let _teamEth = [value, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let comment = 'test';
    fomo.buysXid(_gameID, _teamEth, 0, comment, value)
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  });
});
