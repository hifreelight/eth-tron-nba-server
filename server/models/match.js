'use strict';
const _ = require('lodash');

let debug = require('debug')('rand:match');
const DateUtils = require('../lib/dateUtils');
let du = new DateUtils();

const STATUS_OPENING = 'opening';
const STATUS_COMING = 'coming';
const STATUS_OVER = 'over';
const MATCH_OVER = '完赛';
const EARLY_OPENING_HOURS = 24;
let fomo = require('../lib/betTownFomo');

module.exports = function(Match) {
  // call contract save result
  // ip limit
  // redis lock
  Match._create = (data, options, cb) => {
    let { eventId, category, title, time, name1, img1, name2, img2 } = data;
    const afterWeekly = du.getTimeByDay(1);
    if (time > afterWeekly) {
      return cb(null, { sleep: 0 });
    }
    let matchInstance = null;
    Match.findOrCreate({ where: { eventId } }, data)
      .then(result => {
        matchInstance = result[0];
        return Promise.all([
          Match.app.models.Team.findOne({ 'nameZh': name1 }),
          Match.app.models.Team.findOne({ 'nameZh': name2 }),
        ]);
      })
      .then(teams => {
        let [team1, team2] = teams;
        if (matchInstance.isCreated) {
          return cb(null, { sleep: 0 }); ;
        }
        // send contract createGame
        const items = ['1-4', '5-7', '8-11', '12-17', '18+'];
        let _teams = [];
        for (let i of items) {
          _teams.push(team1.nameEn + i);
        }
        for (let i of items) {
          _teams.push(team2.nameEn + i);
        }
        fomo.createGame(eventId + '', _teams)
          .then(response => {
            debug('createGame response is %o', response);
          })
          .catch(err => {
            console.error('fomo createGame err is %o', err);
          });
        cb(null, { sleep: 60 });
      })
      .catch(err => cb(err));
  };
  Match._find = () => {

  };
  Match.basketball = (status, options, cb) => {
    let filters = { where: { category: 'nba' }, order: 'time ASC' };
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
