'use strict';
const _ = require('lodash');

let debug = require('debug')('rand:match');
const util = require('../lib/util');
const DateUtils = require('../lib/dateUtils');
let du = new DateUtils();

const STATUS_OPENING = 'opening';
const STATUS_COMING = 'coming';
const STATUS_OVER = 'over';
const MATCH_OVER = '完赛';
const EARLY_OPENING_HOURS = 24;
const AFTER_DAY = 3;
let fomo = require('../lib/betTownFomo');
const fomoTron = require('../lib/betTownFomoTron');

module.exports = function(Match) {
  Match.beforeRemote('_create', function(ctx, options, next) {
    // white list
    let clientIp = ctx.req.connection.remoteAddress;
    clientIp = ctx.req.headers['x-real-ip'] || clientIp;
    debug('clientIp is %s', clientIp);
    if (Match.app.get('whiteList').indexOf(clientIp) > -1) {
      return next();
    }
    next(util.error('Forbidden', 403));
  });
  // call contract save result
  // ip limit
  // redis lock
  Match._create = (data, options, cb) => {
    let { eventId, category, title, time, name1, img1, name2, img2 } = data;
    const afterWeekly = du.getTimeByDay(AFTER_DAY);
    if (time > afterWeekly) {
      return cb(null, { sleep: 0 });
    }
    let matchInstance = null;
    Match.findOrCreate({ where: { eventId } }, data)
      .then(result => {
        matchInstance = result[0];
        return Promise.all([
          Match.app.models.Team.findOne({ where: { 'nameZh': name1 } }),
          Match.app.models.Team.findOne({ where: { 'nameZh': name2 } }),
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
        fomoTron.createGame(eventId + '', _teams)
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
  Match.basketball = (coin, status, options, cb) => {
    coin = coin || 'eth';
    let filters = { where: { category: 'nba' }, include: ['team1', 'team2'], order: 'time ASC' };
    if (status == STATUS_OPENING) {
      let time = du.getTimeByHour(EARLY_OPENING_HOURS);

      filters.where = _.merge(filters.where, { time: { lte: time }, periodCn: { neq: MATCH_OVER } });
      if (coin == 'eth') {
        filters.where = _.merge(filters.where, { isActivate: 1 });
      } else {
        filters.where = _.merge(filters.where, { TronIsActivate: 1 });
      }
    }
    if (status == STATUS_COMING) {
      let time = du.getTimeByHour(EARLY_OPENING_HOURS);
      filters.where = _.merge(filters.where, { time: { gt: time } });
    }
    if (status == STATUS_OVER) {
      filters.where = _.merge(filters.where, { periodCn: MATCH_OVER });
      if (coin == 'eth') {
        filters.where = _.merge(filters.where, { isActivate: 1 });
      } else {
        filters.where = _.merge(filters.where, { TronIsActivate: 1 });
      }
      filters.order = 'time DESC';
      filters.limit = 50;
    }
    Match.find(filters)
      .then(respones => {
        cb(null, respones);
      })
      .catch(err => {
        cb(err);
      });
  };

  Match.detail = (eventId, options, cb) => {
    Match.findOne({ where: { eventId }, include: ['team1', 'team2'] })
      .then(match => {
        cb(null, match);
      })
      .catch(err => cb(err));
  };
};
