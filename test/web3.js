'use strict';

const Web3 = require('web3');
let provider = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/VUQN99VRVQB728EHQX9QKEF1SVQNFJ3P42');
let web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/VUQN99VRVQB728EHQX9QKEF1SVQNFJ3P42'));
// web3.setProvider(provider);

let contracts = {
  BetTown: {
    address: '0xBDd3Ee8afa7b41F1BDfe02200bFA171535caFc27',
    owner: '0x7b6a507BA5e2c249984Ab3d9517a7133fC0e6703',
    ownerKeystoreV3: { 'address': 'a7f28d58dd71913e8c64ca9c05c22cd8a56f0c51', 'crypto': { 'cipher': 'aes-128-ctr', 'ciphertext': '3fddc2b0d1502f5dcde2d8a8b1298017b919f2999dbf8eca5b75c657192086e7', 'cipherparams': { 'iv': '181e0e81165e33635750ec7a846cddc6' }, 'kdf': 'scrypt', 'kdfparams': { 'dklen': 32, 'n': 262144, 'p': 1, 'r': 8, 'salt': 'ac3ddfb17a0a7f6344e80fcebfc601955e8289e60d2b2e2272d724750c44483d' }, 'mac': '7e2d06c99667f428632acf84efc9d603e20fc84ef94aaaa0d1ea718e964254de' }, 'id': '50f48649-89b0-4930-8ad4-2ac74898df38', 'version': 3 },
    ownerPassword: 'qingwo6688',
    randomKey: '221310E2B78B34A2D756A1E8ED79A6BCCE1ADD1FE31D3313A991F70E993E9294',
  },
};
let { address, owner } = contracts.BetTown;
let BetTownContract = new web3.eth.Contract(require('../contracts/BetTown').abi, address, { from: owner });

BetTownContract.events.LogBet({
  filter: {}, // Using an array means OR: e.g. 20 or 23
  fromBlock: 0,
}, function(error, event) { console.log(event); })
.on('data', function(event) {
  console.log(event); // same results as the optional callback above
})
.on('changed', function(event) {
  // remove event from local database
})
.on('error', console.error);

BetTownContract.getPastEvents('LogBet', {
  filter: {}, // Using an array means OR: e.g. 20 or 23
  fromBlock: 0,
  toBlock: 'latest',
}, function(error, events) { console.log(events); })
.then(function(events) {
  console.log(events); // same results as the optional callback above
});

BetTownContract.getPastEvents('allEvents', {
  filter: {}, // Using an array means OR: e.g. 20 or 23
  fromBlock: 0,
  toBlock: 'latest',
}, function(error, events) { console.log(events); })
.then(function(events) {
  console.log(events[0]); // same results as the optional callback above
  console.log(events.length);
});

// BetTownContract.events.allEvents({ fromBlock: 0, toBlock: 'latest' }, function(error, logs) {
//   if (!error) {
//     console.log(logs);
//   } else {
//     console.error(error);
//   }
// });

// BetTownContract.methods.LogResult()
//   .call({ some: 'args' }, { fromBlock: 0, toBlock: 'latest' }, function(error, result) {
//     console.log(result);
//   });
