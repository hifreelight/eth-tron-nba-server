'use strict';

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
    address: isProd ? process.env.FOMO_TRON_ADDRESS :  'TGydncTFhU4inD6Y6pJTfJ1149JTCap3uU',
    owner: isProd ? process.env.FOMO_TRON_OWNER :   'TGydncTFhU4inD6Y6pJTfJ1149JTCap3uU',
    activeAddress: isProd ? process.env.FOMO_TRON_ACTIVE_ADDRESS :  'TXAsg1x5Y6mnyx5Z3vsCRNRchMvKwJMUbs',
    activePrivateKey: isProd ? process.env.FOMO_TRON_ACTIVE_PRIVATE_KEY :   '24a1a7e24a956138b0abf0a47cee816bd7180762f2c7df7167925c8c12e8dc98',
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
    // return this.contract.createGame(name, teamNames)
    //   .send({
    //     shouldPollResponse: true,
    //     callValue: 0,
    //   })
    //   .then(response => {
    //     console.log(response);
    //   });
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
  activate(gameId, startTime) {
    return this.send('activate', gameId, startTime);
  }
  setCloseTime(gameId, closeTime) {
    return this.send('setCloseTime', gameId, closeTime);
  }
  settleGame(gameId, team, comment, deadline) {
    return this.send('settleGame', gameId, team, comment, deadline);
  }
  async buysXid(_gameID, _teamEth, _affCode, comment, value) {
    let txBuilder = fomoContract.methods.buysXid(_gameID, _teamEth, _affCode, comment);
    let encodedTx = txBuilder.encodeABI();
    let amountOfGas = 4000000;
    let nonce = await web3.eth.getTransactionCount(activeAddress) + 1;
    debug('send once is %d', nonce);
    let transactionObject = {
      // nonce: nonce,
      // gasPrice: '20000000000',
      gas: amountOfGas,
      data: encodedTx,
      from: activeAddress,
      to: address,
      value,
    };
    return web3.eth.accounts.signTransaction(transactionObject, '0x' + activePrivateKey)
      .then(signedTx => {
        return web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(error, response) {
          debug('response is %o', response);
        })
          .on('receipt', function(receipt) {
            debug('receipt is %o', receipt);
            //do something
            return receipt;
          })
          .catch(err => {
            console.error('sendSignedTransaction err is %o', err);
            return err;
          });
      })
      .catch(err => {
        console.error('signTransaction err is %o', err);
      });
  }
  isConnected() {
    return this.web3.isConnected;
  }
}
const fomo = new BetTownFomoTron();
module.exports = fomo;
