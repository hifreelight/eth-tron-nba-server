'use strict';

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');
const server = require('../server.js');
const redis = require('./redis');
const { promisify } = require('util');
const Web3Util = require('./web3-util');
const EventEmitter = require('events').EventEmitter;

let internalEtherSvc = process.env.INTERNAL_ETHER_SVC || 'http://39.106.138.211:8545';
let internalEtherWSvc = process.env.INTERNAL_ETHER_WSVC || 'ws://39.106.138.211:8546';
let etherSvc = process.env.ETHER_SVC || 'https://ropsten.infura.io/VUQN99VRVQB728EHQX9QKEF1SVQNFJ3P42';
// let etherSvc = process.env.ETHER_SVC || 'http://39.106.138.211:8545';
let etherWSvc = process.env.ETHER_WSVC || 'wss://ropsten.infura.io/ws/VUQN99VRVQB728EHQX9QKEF1SVQNFJ3P42';
// let web3 = new Web3(new Web3.providers.HttpProvider(internalEtherSvc));
// let pubWeb3 = new Web3(new Web3.providers.HttpProvider(etherSvc));
// let web3Provider = new Web3.providers.WebsocketProvider(internalEtherWSvc);
let web3Provider = new Web3.providers.HttpProvider(internalEtherSvc);
let web3 = new Web3(web3Provider);

let pubWeb3Provider = new Web3.providers.HttpProvider(etherSvc);
let pubWeb3 = new Web3(pubWeb3Provider);

let contracts = {
  BetTown: {
    address: '0xccddbf11a195576dec97c5a11a2718e91fc648e2',
    owner: '0x7b6a507BA5e2c249984Ab3d9517a7133fC0e6703',
    ownerKeystoreV3: { 'address': 'a7f28d58dd71913e8c64ca9c05c22cd8a56f0c51', 'crypto': { 'cipher': 'aes-128-ctr', 'ciphertext': '3fddc2b0d1502f5dcde2d8a8b1298017b919f2999dbf8eca5b75c657192086e7', 'cipherparams': { 'iv': '181e0e81165e33635750ec7a846cddc6' }, 'kdf': 'scrypt', 'kdfparams': { 'dklen': 32, 'n': 262144, 'p': 1, 'r': 8, 'salt': 'ac3ddfb17a0a7f6344e80fcebfc601955e8289e60d2b2e2272d724750c44483d' }, 'mac': '7e2d06c99667f428632acf84efc9d603e20fc84ef94aaaa0d1ea718e964254de' }, 'id': '50f48649-89b0-4930-8ad4-2ac74898df38', 'version': 3 },
    ownerPassword: 'qingwo6688',
    randomKey: '221310E2B78B34A2D756A1E8ED79A6BCCE1ADD1FE31D3313A991F70E993E9294',
  },
};

for (const tokenName in contracts) {
  if (contracts.hasOwnProperty(tokenName)) {
    const c = contracts[tokenName];
    c.contract = new web3.eth.Contract(require('../../contracts/' + tokenName).abi, c.address, { from: c.owner });
    let decrypted = web3.eth.accounts.decrypt(c.ownerKeystoreV3, c.ownerPassword);
    c.privateKey = decrypted.privateKey.substring(2); // remove prefix '0x'
  }
}

module.exports = class Web3Util extends EventEmitter {
  constructor() {
    super();

    let self = this;
    let provider;

    this.web3 = web3;
    this.pubWeb3 = pubWeb3;
    this.provider = this.pubWeb3.currentProvider;

    if (this.provider.constructor.name == 'WebsocketProvider') {
      this.connect();
    }

    console.log('public net service:', this.provider.host);
    this.GAS = 22899;
    this.GAS_PRICE = 20000000000;

    this.redis = redis.createRedisClient();
    this.getCache = promisify(this.redis.get).bind(this.redis);
    this.setCache = promisify(this.redis.set).bind(this.redis);
    this.isInSet = promisify(this.redis.sismember).bind(this.redis);
    this.addSet = promisify(this.redis.sadd).bind(this.redis);

    this.WATCH_ADDRESS_KEY = 'wallet:addr:set';
    this.BLOCK_NUMBER_KEY = 'wallet:blocknumber';
    this.SAFE_BLOCK_NUMBER = 12; // https://www.reddit.com/r/ethereum/comments/4eplsv/how_many_confirms_is_considered_safe_in_ethereum/
    console.log('redis is connected!');
  }

  connect() {
    let self = this;
    let provider = this.provider;
    console.log('WS connected.');
    provider.on('error', e => console.error('pubWeb3Provider WS Error', e));
    provider.on('end', e => {
      console.log('pubWeb3Provider WS closed');
      console.log('Attempting to reconnect...');
      provider = new Web3.providers.WebsocketProvider(etherWSvc);
      self.provider = provider;

      provider.on('connect', self.connect.bind(self));
      self.pubWeb3.setProvider(provider);
      self.subscribe();
    });
  }

  async setScanBlockNumber(scanFromBlockNumber) {
    let web3 = this.pubWeb3;
    if (scanFromBlockNumber) {
      this.scanFromBlockNumber = scanFromBlockNumber;
      await this.setCache(this.BLOCK_NUMBER_KEY, scanFromBlockNumber);
    } else {
      // FIXME: infura.io doesn't response so we only scan most recent blocks
      let cur = await web3.eth.getBlockNumber() - 50;
      let env = process.env.SCAN_BLOCK_NUMBER;
      let cache = await this.getCache(this.BLOCK_NUMBER_KEY);
      await this.setScanBlockNumber(parseInt(cache || env || cur));
    }
  }

  async addWatchAddress(addresses) {
    await this.addSet(this.WATCH_ADDRESS_KEY, addresses);
  }

  async scanTransaction() {
    let web3 = this.pubWeb3;
    let self = this;

    // scan max 10 block each time
    let scanToBlockNumber = Math.min(this.scanFromBlockNumber + 10, await web3.eth.getBlockNumber() - 12);
    console.log('scan block from:', this.scanFromBlockNumber, 'to:', scanToBlockNumber);

    // batch doesnt work
    // let batch = new web3.BatchRequest();

    // for (let blockNumber = this.scanFromBlockNumber; blockNumber <= scanToBlockNumber; blockNumber++) {
    //   batch.add(web3.eth.getBlock.request(blockNumber, true, block => {
    //     console.log('scaning block:', block.number);

    //     let transactions = block.transactions;
    //     if (!transactions) {
    //       console.log('transactions are empty!');
    //     } else {
    //       console.log(transactions.length, 'transactions to scan');
    //       transactions.forEach(tx => {
    //         console.log(tx);
    //       });
    //     }
    //   }));
    // }
    // batch.execute();

    for (let blockNumber = this.scanFromBlockNumber; blockNumber <= scanToBlockNumber; blockNumber++) {
      console.log('get block:', blockNumber);
      let block;
      try {
        block = await web3.eth.getBlock(blockNumber, true);

        console.log('scaning block:', block.number);

        let transactions = block.transactions;
        if (!transactions) {
          console.log('transactions are empty!');
        } else {
          console.log(transactions.length, 'transactions to scan');
          for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            if (tx.to && tx.value > 0) {
              let isWatching = await this.isInSet(this.WATCH_ADDRESS_KEY, tx.to.toLowerCase());
              if (isWatching) {
                console.log('=========', tx);
                self.emit('receive eth', tx, self);
              } else {
                // console.log(tx);
              }

              // this.redis.sismember(this.WATCH_ADDRESS_KEY, tx.to.toLowerCase(), (e, isWatching) => {
              //   if (isWatching) {
              //     console.log('=========', tx);
              //     self.emit('receive eth', tx, self);
              //   } else {
              //     console.log(tx);
              //   }
              // });
            } else {
              // console.log(tx);
            }
          }
        }

        await this.setScanBlockNumber(block.number + 1);
      } catch (e) {
        console.log(e);
      }

      // web3.eth.getBlock(blockNumber, true).then(async block => {
      //   console.log('scaning block:', block.number);

      //   let transactions = block.transactions;
      //   if (!transactions) {
      //     console.log('transactions are empty!');
      //   } else {
      //     console.log(transactions.length, 'transactions to scan');
      //     for (let i = 0; i < transactions.length; i++) {
      //       const tx = transactions[i];
      //       if (tx.to && tx.value > 0) {
      //         let isWatching = await this.isInSet(this.WATCH_ADDRESS_KEY, tx.to.toLowerCase());
      //         if (isWatching) {
      //           console.log('=========', tx);
      //           self.emit('receive eth', tx, self);
      //         } else {
      //           // console.log(tx);
      //         }

      //         // this.redis.sismember(this.WATCH_ADDRESS_KEY, tx.to.toLowerCase(), (e, isWatching) => {
      //         //   if (isWatching) {
      //         //     console.log('=========', tx);
      //         //     self.emit('receive eth', tx, self);
      //         //   } else {
      //         //     console.log(tx);
      //         //   }
      //         // });
      //       } else {
      //         // console.log(tx);
      //       }
      //     }
      //   }

      //   await this.setScanBlockNumber(block.number + 1);
      // });
    }
  }

  async subscribe() {
    let web3 = this.pubWeb3;
    let self = this;
    // subscribing 'logs' only is avaliable for smart contract address
    this.subscription = web3.eth.subscribe('newBlockHeaders', function(error, result) {
      if (!error)
        console.log(result);
    })
      .on('data', function(log) {
        web3.eth.getBlock(log.number, true, (e, r) => {
          if (e) {
            console.log('getBlock error:', e);
          } else {
            console.log(r);
          }

          if (r && r.transactions && r.transactions.length > 0) {
            r.transactions.forEach(tx => {
              if (tx.to && self.addresses.indexOf(tx.to.toLowerCase()) != -1) {
                console.log('tx found!');
              }
            });
          }
        });
        console.log(log);
      });
  }

  async isListening(isPublic) {
    let web3 = isPublic ? this.pubWeb3 : this.web3;
    return await web3.eth.net.isListening();
  }

  async createAddress(isPublic) {
    let web3 = isPublic ? this.pubWeb3 : this.web3;
    return await web3.eth.accounts.create();
  }

  async getGasPrice() {
    return await this.web3.eth.getGasPrice();
  }

  async getGasLimit() {
    let block = await this.web3.eth.getBlock('latest');
    return await block.gasLimit;
  }

  async getBalance(address, tokenName) {
    let value;
    if (tokenName === undefined) {
      value = await this.web3.eth.getBalance(address);
    } else {
      if (!contracts[tokenName]) {
        throw new Error('Contract not supported: ' + tokenName);
      }

      let contract = contracts[tokenName].contract;
      value = await contract.methods.balanceOf(address).call();
    }
    return Number(this.web3.utils.fromWei(value));
  }

  async sendToken(tokenName, to, value, from, privateKey) {
    let isETH = (tokenName == 'ETH') || tokenName == undefined;

    // TODO: refact
    tokenName = isETH ? 'FlashU' : tokenName;

    if (!contracts[tokenName] && !isETH) {
      throw new Error('Contract not supported: ' + tokenName);
    }

    let contract = contracts[tokenName].contract;
    if (!from) {
      if (!to) {
        throw new Error('Must specify either from or to');
      }

      from = contracts[tokenName].owner;
      privateKey = contracts[tokenName].privateKey;
    } else if (!to) {
      if (!from || !privateKey) {
        throw new Error('Must specify either from or to');
      }

      to = contracts[tokenName].owner;
    }

    let web3 = isETH ? this.pubWeb3 : this.web3;
    let count = await web3.eth.getTransactionCount(from);
    let rawTransaction;
    let actualValue = parseInt(isETH ? value : web3.utils.toWei(value.toString(), 'ether'));
    let gasPrice = parseInt(await web3.eth.getGasPrice());
    let gasLimit = 90000;

    if (isETH) {
      rawTransaction = {
        nonce: web3.utils.toHex(count),
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(gasLimit),
        to: contracts['FlashU'].address,
        value: web3.utils.toHex(actualValue),
      };

      let balance = await web3.eth.getBalance(from);
      // let gas = await web3.eth.estimateGas(rawTransaction);
      let gas = 21000;
      // let price = web3.utils.fromWei(gasPrice, 'ether');

      console.log('transfer eth from:', from, 'to:', contracts['FlashU'].address, 'amount:', actualValue);

      if (balance < gas * parseInt(gasPrice) + parseInt(value)) {
        actualValue = parseInt(balance) - gas * parseInt(gasPrice);
        console.log('actual amount:', actualValue);
        rawTransaction.value = actualValue;
      }
    } else {
      rawTransaction = {
        nonce: web3.utils.toHex(count),
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(gasLimit),
        to: contracts[tokenName].address,
        value: '0x00',
        data: contract.methods.transfer(to, actualValue).encodeABI(),
      };
    }

    // remove '0x' from privateKey then create buffer
    let pk = Buffer.from(privateKey, 'hex');
    let tx = new Tx(rawTransaction);

    tx.sign(pk);
    return await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
      .on('receipt', console.log)
      .on('error', console.error);
  }
  async listenGame() {
    let web3 = this.pubWeb3;
    var GameAddr = '0xBDd3Ee8afa7b41F1BDfe02200bFA171535caFc27';
    // app.web3.eth.defaultAccount = app.web3.eth.accounts[0];
    let tokenName = 'BetTown';
    let { address, owner } = contracts.BetTown;
    let contract = new web3.eth.Contract(require('../../contracts/' + tokenName).abi, address, { from: owner });
    // let contract = new web3.eth.contract(ABI).at(GameAddr);
    contract = contract.at(GameAddr);

    let events = contract.allEvents({ fromBlock: 0, toBlock: 'latest' });

    events.get(function(error, logs) {
      if (!error) {
        console.log(logs);
      } else {
        console.error(error);
      }
    });
  }
};

