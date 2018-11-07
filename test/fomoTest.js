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
    fomo.createGame('12', ['76er', 'huo'])
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
    console.log(fomo.web3.utils.hexToNumberString(data));
    // console.log(fomo.web3.utils.hexToBytes(data));
    // console.log(fomo.web3.utils.toAscii(data));
    // let SolidityCoder = require('web3/lib/solidity/coder.js');
    // let d = SolidityCoder.decodeParams(['string', 'uint'], log.data.replace('0x', ''));
    // let d = fomo._decodeEventABI({ data: '0x0' }); //event raw data
    // console.log(d);
  });
  it('test onGameCreated', function() {
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
    fomo.activate(3, startTime)
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
});
