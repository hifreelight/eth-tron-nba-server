'use strict';

let assert = require('assert');
let expect = require('expect');
process.env.DEBUG = 'rand:*';
process.env.NODE_ENV = 'test';
let debug = require('debug')('rand:test');
let fomo = require('../server/lib/betTownFomo');
let moment = require('moment');

describe('A suite for fomo', function() {
  this.timeout(1000 * 120);
  let gameId;
  let createGame = () => {
    fomo.createGame('ten', ['Rocket1', 'Rocket2', 'Rocket3', '4', '5',
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
    fomo.contract.events.onGameCreated({
      filter: {},
      fromBlock: 0,
    }, function(error, event) {
    })
    .on('data', function(event) {
      debug('onGameCreated data is %o', event);
      gameId = event.returnValues.gameID;
      let timestamp = parseInt(event.returnValues.timestamp);
      done();
    })
    .on('changed', function(event) {
      // remove event from local database
    })
    .on('error', function(err) {
      console.error('onGameCreated err is %d', err);
    });
  };
  // before(function(done) {
  //   onGameCreated(done);
  //   createGame();
  // });
  it('test createGame', function() {

  });

  it('test activate', function(done) {
    let startTime = moment().unix();
    fomo.activate(gameId, startTime)
      .then(data => {
        console.log(data);
        if (data.status == true) {
          done();
        }
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test buy', function(done) {
    let value = fomo.web3.utils.toWei('0.1', 'ether');
    let _teamEth = [value, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let comment = 'test';
    fomo.buysXid(gameId, _teamEth, 0, comment, value)
      .then(data => {
        console.log(data);
        if (data.status == true) {
          done();
        }
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test close', function(done) {
    let closeTime = moment().unix() + 10;
    fomo.setCloseTime(gameId, closeTime)
      .then(data => {
        console.log(data);
        if (data.status == true) {
          done();
        }
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test settleGame', function(done) {
    let deadline = moment().unix() + 3600 * 36;
    let comment = '76er vs huo 102:100';
    fomo.settleGame(gameId, 0, comment, deadline)
      .then(data => {
        console.log(data);
        if (data.status == true) {
          done();
        }
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test game', function() {
    fomo.getGame(gameId)
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test getGameStatus', function() {
    fomo.getGameStatus(gameId)
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  });
  it('test gasPrice', function() {
    fomo.web3.eth.getGasPrice(function(err, gp) {
      console.log(fomo.web3.utils.fromWei(gp, 'wei'));
      console.log(fomo.web3.utils.fromWei(gp, 'gwei'));
    })
    .then(console.log);
  });
  it('test data', function() {
    let data = '0x000000000000000000000000000000000000000000000000000000005be2990a';
    data = '0x43484920312d3400000000000000000000000000000000000000000000000000';
    data = '0x4348492031382b00000000000000000000000000000000000000000000000000';
    // console.log(fomo.web3.utils.hexToNumberString(data));
    // console.log(fomo.web3.utils.hexToBytes(data));
    console.log(fomo.web3.utils.toAscii(data));
  });
  it('test provider', function() {
    console.log('givenProvider is %o', fomo.web3.givenProvider);
    // console.log('currentProvider is %o', fomo.web3.currentProvider);
    console.log(fomo.isConnected());
  });
});
