'use strict';
const got = require('got');

const ZHIBO_URL = 'https://bifen4pc.qiumibao.com/json/list.htm';

class Zhibo {
  constructor() {
  }
  score() {
    return got.get(ZHIBO_URL)
      .then(response => {
        return JSON.parse(response.body);
      });
  }
}
const zhibo = new Zhibo();
module.exports = zhibo;
