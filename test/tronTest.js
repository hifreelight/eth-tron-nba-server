'use strict';

let assert = require('assert');
let expect = require('expect');
process.env.DEBUG = 'rand:*';
process.env.NODE_ENV = 'test';
let debug = require('debug')('rand:test');
let moment = require('moment');
const TronWeb = require('tronweb');

const fullNode = 'https://api.shasta.trongrid.io';
const solidityNode = 'https://api.shasta.trongrid.io';
const eventServer = 'https://api.shasta.trongrid.io/';
const privateKey = '24a1a7e24a956138b0abf0a47cee816bd7180762f2c7df7167925c8c12e8dc98';

const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    privateKey
);
let userAddress = 'TXAsg1x5Y6mnyx5Z3vsCRNRchMvKwJMUbs';
userAddress = '41E88F7FA07CAAFA03217383C575752D575D967933';

let contractAddress = 'TWRm8qmK3WtE8KBRBdRu7VYYmo5dMv1iPz';
describe('A suite for tron', function() {
  it('test get', function() {
    tronWeb.trx.getBalance(userAddress)
      .then(userBalance => {
        console.log(userBalance);
      });
  });
  /**
   * TCWcdEL57pYNmfgBjnqnrUqbGbmhr6u6pd
   * 411BE0DDCD2AEADE53FFD737DEBFA3CE97AD5BD706
   * https://www.tronscan.org/#/tools/tron-convert-tool
   */
  it('test getContract', function() {
    tronWeb.trx.getContract(contractAddress)
      .then(contract => {
        console.group('Contract from node');
        console.log('- Contract Address: ', contractAddress);
        console.log('- Origin Address:', contract.origin_address);
        console.log('- Bytecode:', contract.bytecode);
        // console.log('- ABI:\n' + JSON.stringify(contract.abi, null, 2), '\n');
        console.groupEnd();
        return contract;
      })
      .then(contract => {
        let abi = contract.abi.entrys;
        console.log('abi is %j', abi);
        // abi = [{ 'constant': false, 'inputs': [{ 'name': 'key', 'type': 'uint256' }, { 'name': 'value', 'type': 'uint256' }], 'name': 'set', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': true, 'inputs': [{ 'name': 'key', 'type': 'uint256' }], 'name': 'get', 'outputs': [{ 'name': 'value', 'type': 'uint256' }], 'payable': false, 'stateMutability': 'view', 'type': 'function' }];
        const setGet = tronWeb.contract(abi, contractAddress);
        setGet.set(1, 3)
          .send({
            shouldPollResponse: true,
            callValue: 0,
          })
          .then(response => {
            return setGet.get(1)
              .call({
                shouldPollResponse: true,
                callValue: 0,
              });
          })

          .then(response => {
            console.log('response is %o', response);
            console.log('response value is %j', response.value);
            console.log('response value hex is %j', response.value._hex);
            console.log('response value int is %j', parseInt(response.value._hex, 16));
          })
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));
  });

  it('test trigger', function() {
    tronWeb.transactionBuilder.triggerSmartContract(
      '411BE0DDCD2AEADE53FFD737DEBFA3CE97AD5BD706',
      'get(uint256)',
      1,
      [
          { type: 'uint256', value: 1 },
      ],
      (err, transaction) => {
        if (err)
          return console.error(err);

        console.group('Unsigned trigger smart contract transaction');
        console.log('- Contract Address: 413c8143e98b3e2fe1b1a8fb82b34557505a752390');
        console.log('- Transaction:\n' + JSON.stringify(transaction, null, 2), '\n');
        console.groupEnd();
      });
  });

  it('test listen', function() {
    startEventListener;
  });
});
