'use strict';
const schedule = require('node-schedule');
const zhibo = require('../lib/zhibo');
const debug = require('debug')('rand:schedule');
const MATCH_OVER = '完赛';
const fomo = require('../lib/betTownFomo');
const fomoTron = require('../lib/betTownFomoTron');
const DateUtils = require('../lib/dateUtils');
let du = new DateUtils();
const redis = require('../lib/ioredis');
const util = require('../lib/util');
const moment = require('moment');

module.exports = async function(app) {
  schedule.scheduleJob('*/10 * * * * *', curl);

  function closeGame(eventId) {
    closeGameCache(eventId)
      .then(response => {
        if (response) {
          return app.models.Match.findOne({ where: { eventId } });
        } else {
          return Promise.reject(`eventId : ${eventId} has close`);
        }
      })
      .then(match => {
        let closeTime = du.getCurrentTimestamp();
        if (!match || !match.gameId) {
          return Promise.reject(`eventId : ${eventId} not create`);
        }
        return Promise.all([
          fomo.setCloseTime(match.gameId, closeTime),
          fomoTron.setCloseTime(match.gameId, closeTime),
        ]);
      })
      .then(data => {
        debug('eventId : %d close data is %o', eventId, data);
      })
      .catch(err => {
        if (typeof err === 'string') {
          debug('closeGame err is %s', err);
        } else {
          console.error('close game err is %o', err);
        }
      });
  }

  function closeGameCache(eventId) {
    let key = 'Fomo:closeGame:' + eventId;
    return redis.set(key, 1, 'NX');
  }

  function settleGameCache(eventId) {
    let key = 'Fomo:settleGame:' + eventId;
    return redis.set(key, 1, 'NX');
  }

  function settleGame(eventId, scores) {
    let match = {};
    settleGameCache(eventId)
      .then(response => {
        if (response) {
          return app.models.Match.findOne({ where: { eventId } });
        } else {
          return Promise.reject(`eventId : ${eventId} has settle`);
        }
      })
      .then(_match => {
        match = _match;
        if (!match.gameId) {
          return Promise.reject(`eventId : ${eventId} has not create`);
        }
        if (!match.isActivate) {
          return Promise.reject(`eventId : ${eventId} has not activate`);
        }
        return Promise.all([
          app.models.Team.findOne({ where: { 'nameZh': match.name1 } }),
          app.models.Team.findOne({ where: { 'nameZh': match.name2 } }),
        ]);
      })
      .then(teams => {
        let [team1, team2] = teams;
        let deadline = moment().unix() + 3600 * 48;
        let comment = `${team1.nameEn} vs ${team2.nameEn} ${scores.score1}:${scores.score2}`;
        let range = [1, 5, 8, 12, 18, 100];
        let winTeamIndex = null;
        let score1 = parseInt(scores.score1);
        let score2 = parseInt(scores.score2);
        if (score1 > score2) {
          const diff = score1 - score2;
          winTeamIndex = util.findIndex(diff, range);
        } else {
          const diff = score2 - score1;
          winTeamIndex = util.findIndex(diff, range) + 5;
        }
        if (isNaN(winTeamIndex)) {
          console.error('winTeamIndex invalid');
          return;
        }
        debug('eventId : %d, gameId: %d, winTeamIndex: %d, comment: %s, deadline: %d',
        eventId, match.gameId, winTeamIndex, comment, deadline);

        fomo.settleGame(match.gameId, winTeamIndex, comment, deadline)
          .then(data => {
            debug('eventId : %d settle data is %o', eventId, data);
          })
          .catch(err => {
            if (typeof err === 'string') {
              debug('settleGame err is %s', err);
            } else {
              console.error('settleGame err is %o', err);
            }
          });
        fomoTron.settleGame(match.gameId, winTeamIndex, comment, deadline)
          .then(data => {
            debug('eventId : %d settle data is %o', eventId, data);
          })
          .catch(err => {
            if (typeof err === 'string') {
              debug('settleGame err is %s', err);
            } else {
              console.error('settleGame err is %o', err);
            }
          });
      })
      .catch(err => {
        console.error('settle game err is %o', err);
      });
  }
  function curl() {
    zhibo.score()
      .then(data => {
        // debug('data is %s', JSON.stringify(data.list));
        let list = data.list;
        for (let l of list) {
          if (l.type == 'basketball') {
            let r = {
              score1: l.visit_score,
              score2: l.home_score,
              periodCn: l.period_cn,
            };
            if (!r.score1 || !r.score2) {
              continue;
            }
            app.models.Match.findOne({ where: { eventId: l.id } })
              .then(match => {
                if (!match) {
                  return;
                }
                // debug('score data r is %O', r);
                // 第4节\n09:56 第4节↵07:26 第4节↵08:56
                if (r.periodCn.indexOf('第4节\n10') > -1 ||
                r.periodCn.indexOf('第4节↵10') > -1) {
                  debug('call contract closeGame');
                  closeGame(l.id);
                }
                if (r.periodCn == MATCH_OVER) {
                  debug('call contract settleGame');
                  settleGame(l.id, r);
                }
                match.updateAttributes(r);
              });
          }
        }
      })
      .catch(err => {
        console.error('curl err is %o', err);
      });
  }
};
