'use strict';

const fetch = require('node-fetch');
const debug = require('debug')('lib:block');
const app = require('../server');
const provider = process.env.BLOCK_PROVIDER || app.get('provider');
const MAX_BLOCK = process.env.MAX_BLOCK || 5;

let top = 0; // 0: not set yet

function getInfoFromProvider(blockNumber) {
  let endpoint = provider.replace('{blockNumber}', blockNumber ? blockNumber.toString(16) : 'latest');
  debug('getInfoFromProvider: endpoint %s', endpoint);
  let opts = {};
  opts.timeout = 1000 * 60;
  return fetch(endpoint, opts)
    .then(r => {
      debug('requested url (%d): %s', r.status, endpoint);
      if (!r.ok) {
        throw new Error('Cannot get block info from:' + endpoint);
      }
      return r.json();
    })
    .then(r => {
      debug('getHash: %j', r);

      return {
        hash: r.result.hash.toLowerCase(),
        number: parseInt(r.result.number),
        time: parseInt(r.result.timestamp),
      };
    })
    .catch((err) => {
      throw err;
    });
}

function getInfo() {
  return getInfoFromProvider()
    .then(info => {
      let count = MAX_BLOCK; // count to query block info, not exceeds MAX_BLOCK
      if (top !== 0) {
        count = info.number - top;
        if (count > MAX_BLOCK) {
          count = MAX_BLOCK;
        }
      }

      let blockNumber = info.number - 1;
      let ps = [];
      let infos = [info];
      while (count > 0) {
        ps.push(getInfoFromProvider(blockNumber));
        blockNumber--;
        count--;
      }

      return Promise.all(ps)
        .then(rs => {
          return infos.concat(rs);
        });
    });
}

module.exports = {
  setTop: function(_top) {
    top = _top;
  },

  getInfo: getInfo,
};
