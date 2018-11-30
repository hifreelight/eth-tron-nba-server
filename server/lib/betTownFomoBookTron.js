'use strict';

const debug = require('debug')('rand:lib:betTownFomoBookTron');
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
    address: isProd ? process.env.FOMO_TRON_BOOK_ADDRESS :  'TTvJzHUDBwGRFqhTxN6yYTWu9SyxXryabZ',
    owner: isProd ? process.env.FOMO_TRON_BOOK_OWNER :   'TNJ1aHwt3Ux9bfqoS2f5PgWsYM8LnCEhDn',
    activeAddress: isProd ? process.env.FOMO_TRON_BOOK_ACTIVE_ADDRESS :  'TXAsg1x5Y6mnyx5Z3vsCRNRchMvKwJMUbs',
    activePrivateKey: isProd ? process.env.FOMO_TRON_BOOK_ACTIVE_PRIVATE_KEY :   '24a1a7e24a956138b0abf0a47cee816bd7180762f2c7df7167925c8c12e8dc98',
  },
};
const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    contracts.Fomo.activePrivateKey
);
let { address, owner, activeAddress, activePrivateKey } = contracts.Fomo;
const fomoContract = tronWeb.contract(require('../../contracts/FomoBookTron').abi, address);

class BetTownFomoBookTron extends EventEmitter {
  constructor() {
    super();
    this.tronWeb = tronWeb;
    this.contract = fomoContract;
  }

  pIDxAddr_(address) {
    return this.contract.pIDxAddr_(address).call()
      .then(data => {
        return data;
      });
  }
}
const book = new BetTownFomoBookTron();
module.exports = book;
