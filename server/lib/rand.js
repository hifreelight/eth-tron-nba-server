'use strict';

const Chance = require('chance');
const seedrandom = require('seedrandom');
const block = require('./block');
const debug = require('debug')('lib:rand');

// let useChance = process.env.RAND_ALG === 'chance';
let useChance = true;

class Rand {
  constructor(blockInfo) {
    if (!blockInfo) {
      throw new Error('blockInfo');
    }

    this.blockInfo = blockInfo;
    this.chance = new Chance(this.blockInfo.hash);

    //TODO: seedrandom
    // seedrandom.alea(seed);
  }

  get blockNumber() {
    return this.blockInfo.number;
  }

  get blockTime() {
    return this.blockInfo.time;
  }

  array(count, min, max) {
    if (useChance) {
      let arr = [];
      for (let i = 0; i < count; i++) {
        arr.push(this.integer(min, max));
      }
      return arr;
    }
  }

  integer(min, max) {
    if (useChance) {
      return this.chance.integer({ min: min, max: max });
    }
  }
}

module.exports = Rand;
