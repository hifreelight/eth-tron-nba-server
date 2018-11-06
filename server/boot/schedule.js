'use strict';
const schedule = require('node-schedule');
const zhibo = require('../lib/zhibo');
const debug = require('debug')('rand:schedule');
const MATCH_OVER = '完赛';

module.exports = async function(app) {
  schedule.scheduleJob('*/10 * * * * *', curl);
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
            debug('r is %O', r);
            if (r.periodCn == MATCH_OVER) {
              debug('call contract save result');
            }
            app.models.Match.updateAll({ eventId: l.id }, r);
          }
        }
      });
  }
};
