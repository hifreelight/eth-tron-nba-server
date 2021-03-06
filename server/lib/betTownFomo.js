'use strict';

const debug = require('debug')('rand:lib:betTownFomo');
const Web3 = require('web3');
const EventEmitter = require('events').EventEmitter;
const apiKey = 'VUQN99VRVQB728EHQX9QKEF1SVQNFJ3P42';
const isProd = process.env.NODE_ENV == 'production' ? true : false;
let httpUrl = isProd ? 'https://mainnet.infura.io/' + apiKey : 'https://ropsten.infura.io/' + apiKey;
let wssUrl = isProd ? 'wss://mainnet.infura.io/ws/' + apiKey : 'wss://ropsten.infura.io/ws/' + apiKey;

let provider = new Web3.providers.WebsocketProvider(wssUrl);
let web3 = new Web3(new Web3.providers.HttpProvider(httpUrl));
web3.setProvider(provider);

let contracts = {
  Fomo: {
    // address: isProd ? process.env.FOMO_ADDRESS :  '0xaef4224aaae293f877ae79480c2404573965feea',
    // address: isProd ? process.env.FOMO_ADDRESS :  '0x0C83A94238fd2491D9E09D679708abe90ecB2657',
    address: isProd ? process.env.FOMO_ADDRESS :  '0x2b9FBbED7cC50B7f287c76c3d31489E490510374',
    owner: isProd ? process.env.FOMO_OWNER :   '0x7b6a507BA5e2c249984Ab3d9517a7133fC0e6703',
    activeAddress: isProd ? process.env.FOMO_ACTIVE_ADDRESS :  '0xfCaF08c2b82618B377338265629e686D711B3714',
    activePrivateKey: isProd ? process.env.FOMO_ACTIVE_PRIVATE_KEY :   '221310E2B78B34A2D756A1E8ED79A6BCCE1ADD1FE31D3313A991F70E993E9294',
  },
};
let { address, owner, activeAddress, activePrivateKey } = contracts.Fomo;
let fomoContract = new web3.eth.Contract(require('../../contracts/Fomo').abi, address, { from: owner });

class BetTownFomo extends EventEmitter {
  constructor() {
    super();
    this.web3 = web3;
    this.contract = fomoContract;
    this.provider = this.web3.currentProvider;

    if (this.provider.constructor.name == 'WebsocketProvider') {
      this.connect();
    }
  }
  connect() {
    let self = this;
    let provider = this.provider;
    debug('WS connected.');
    provider.on('error', e => console.error('pubWeb3Provider WS Error', e));
    provider.on('disconnect', () => {
      debug('WS disconnect.');
    });
    provider.on('end', e => {
      debug('pubWeb3Provider WS closed');
      debug('Attempting to reconnect...');
      provider = new Web3.providers.WebsocketProvider(wssUrl);
      self.provider = provider;

      provider.on('connect', self.connect.bind(self));
      self.web3.setProvider(provider);
      self.emit('fomo listning', self);
    });
  }
  async createGame(name, teamNames) {
    teamNames = teamNames.map((n)=>{
      return web3.utils.fromAscii(n);
    });
    return this.send('createGame', name, teamNames);
  }
  async send(fun, ...args) {
    debug('fun: %s, args: %o', fun, ...args);
    let txBuilder = fomoContract.methods[fun](...args);
    let encodedTx = txBuilder.encodeABI();
    let amountOfGas = 400000;
    let nonce = await web3.eth.getTransactionCount(activeAddress) + 1;
    debug('send once is %d', nonce);
    let transactionObject = {
      // nonce: nonce,
      // gasPrice: '20000000000',
      gas: amountOfGas,
      data: encodedTx,
      from: activeAddress,
      to: address,
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
  onGameCreated() {
    fomoContract.events.onGameCreated({
      filter: {}, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
    }, function(error, event) {
      debug('onGameCreated event is %o', event);
    })
    .on('data', function(event) {
      console.log(event); // same results as the optional callback above
      debug('onGameCreated data is %o', event);
    })
    .on('changed', function(event) {
      // remove event from local database
    })
    .on('error', console.error);
  }
  getGameStatus(gameId) {
    return fomoContract.methods.getGameStatus(gameId).call()
      .then(data => {
        return data;
      });
  }
  getGame(gameId) {
    return fomoContract.methods.game_(gameId).call()
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
  withdraw(gameId) {
    return this.send('withdraw', gameId);
  }
  async buysXid(_gameID, _teamEth, value) {
    let txBuilder = fomoContract.methods.buysXid(_gameID, _teamEth);
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
const fomo = new BetTownFomo();
module.exports = fomo;
