'use strict';
const _ = require('lodash');

const DateUtils = require('../lib/dateUtils');
let du = new DateUtils();

const STATUS_OPENING = 'opening';
const STATUS_COMING = 'coming';
const STATUS_OVER = 'over';
const MATCH_OVER = '完赛';
const EARLY_OPENING_HOURS = 24;

module.exports = function(Match) {
  // call contract save result
  // ip limit
  // redis lock
  Match._create = (data, options, cb) => {
    let { eventId, category, title, time } = data;
    Match.findOrCreate({ where: { eventId } }, data)
      .then(result => {
        cb(null, result);
      })
      .catch(err => cb(err));
  };
  Match._find = () => {

  };
  Match.basketball = (status, options, cb) => {
    let filters = { where: { category: 'nba' } };
    if (status == STATUS_OPENING) {
      let time = du.getTimeByHour(EARLY_OPENING_HOURS);
      filters.where = _.merge(filters.where, { time: { lte: time }, periodCn: { neq: MATCH_OVER } });
    }
    if (status == STATUS_COMING) {
      let time = du.getTimeByHour(EARLY_OPENING_HOURS);
      filters.where = _.merge(filters.where, { time: { gt: time } });
    }
    if (status == STATUS_OVER) {
      filters.where = _.merge(filters.where, { periodCn: MATCH_OVER });
    }
    Match.find(filters)
      .then(respones => {
        cb(null, respones);
      })
      .catch(err => {
        cb(err);
      });
  };
};
