'use strict';
require('dotenv').config({ path: __dirname + '/../../test/.env' });
const debug = require('debug')('rand:lib:betTownFomoTron');
const EventEmitter = require('events').EventEmitter;
const TronWeb = require('tronweb');
const isProd = process.env.NODE_ENV == 'production' ? true : false;
let fullNode = isProd ? 'https://api.trongrid.io/' : 'https://api.shasta.trongrid.io/';
const solidityNode = isProd ? 'https://api.trongrid.io' :  'https://api.shasta.trongrid.io';
const eventServer = isProd ? 'https://api.trongrid.io/' :  'https://api.shasta.trongrid.io/';
const Web3 = require('web3');
const web3 = new Web3();

let contracts = {
  Fomo: {
    address: isProd ? process.env.FOMO_TRON_ADDRESS : 'TL8zwVcxTuD6TUWxjeBnQtj6RCQv2w6hpC',
    owner: isProd ? process.env.FOMO_TRON_OWNER : 'TNJ1aHwt3Ux9bfqoS2f5PgWsYM8LnCEhDn',
    activeAddress: isProd ? process.env.FOMO_TRON_ACTIVE_ADDRESS :  'TXAsg1x5Y6mnyx5Z3vsCRNRchMvKwJMUbs',
    activePrivateKey: isProd ? process.env.FOMO_TRON_ACTIVE_PRIVATE_KEY :   '24a1a7e24a956138b0abf0a47cee816bd7180762f2c7df7167925c8c12e8dc98',//dev
    // activeAddress: isProd ? process.env.FOMO_TRON_ACTIVE_ADDRESS :  'TKB6VGv2Q9EoJJK3Jj5Cx4Ga26xksMqKh4',
    // activePrivateKey: isProd ? process.env.FOMO_TRON_ACTIVE_PRIVATE_KEY : '3a4c01bf4c19ac828d5d25fe8db2ef651412315e6246629961b2b624b6bfb426', //test
  },
};
const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    contracts.Fomo.activePrivateKey
);
let { address, owner, activeAddress, activePrivateKey } = contracts.Fomo;
const fomoContract = tronWeb.contract(require('../../contracts/FomoTron').abi, address);

class BetTownFomoTron extends EventEmitter {
  constructor() {
    super();
    this.tronWeb = tronWeb;
    this.contract = fomoContract;
  }
  async createGame(name, teamNames) {
    teamNames = teamNames.map((n)=>{
      n = n.toString();
      const len = n.length;
      if (len < 32) {
        for (let i = 0; i < 32 - len; i++) {
          n = '0' + n;
        }
      }
      return tronWeb.fromAscii(n);
    });
    console.log('teamNames is %O', teamNames);
    return this.send('createGame', name, teamNames);
  }
  async send(fun, ...args) {
    debug('fun: %s, args: %o', fun, ...args);
    return this.contract[fun](...args)
      .send({
        shouldPollResponse: true,
        callValue: 0,
      })
      .then(response => {
        console.log(response);
      });
  }
  onGameCreated() {
    return this.contract.onGameCreated().watch((err, data)=> {
      if (!data) {
        return console.error('data is null or undefined');
      }
      if (err) return console.error('Failed to bind event listener:', err);
      let { result } = data;
      if (result) {
        console.log('onGameCreated result is %o', result);
      }
      return result;
    });
  }
  getGameStatus(gameId) {
    return this.contract.getGameStatus(gameId).call()
      .then(data => {
        return data;
      });
  }
  getGame(gameId) {
    return this.contract.game_(gameId).call()
      .then(data => {
        return data;
      });
  }
  getPlayerStatus(gameId, pid) {
    return this.contract.getPlayerStatus(gameId, pid).call()
      .then(data => {
        return data;
      });
  }
  getGameStatus(gameId) {
    return this.contract.getGameStatus(gameId).call()
      .then(data => {
        return data;
      });
  }
  activate(gameId, startTime) {
    return this.send('activate', gameId, startTime);
  }
  setCloseTime(gameId, closeTime) {
    return this.send('setCloseTime', gameId, closeTime);
  }
  settleGame(gameId, team, comment, deadline) {
    return this.send('settleGame', gameId, team, comment, deadline);
  }
  async buysXid(_gameID, _teamEth, value) {
    return this.contract.buysXid(_gameID, _teamEth)
      .send({
        shouldPollResponse: true,
        callValue: value,
      })
      .then(response => {
        console.log(response);
      })
      .catch(err => {
        console.error(err);
      });
  }
  isConnected() {
    return this.web3.isConnected;
  }
}
const fomo = new BetTownFomoTron();
module.exports = fomo;
