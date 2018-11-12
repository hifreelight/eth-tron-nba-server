'use strict';
const fomo = require('../lib/betTownFomo');
const debug = require('debug')('rand:boot:betTownFomo');
const DateUtils = require('../lib/dateUtils');
let du = new DateUtils();

module.exports = function(app) {
  let activateTimer = function(gameId, matchTime) {
    let now = du.getCurrentTimestamp();
    let matchTs = du.string2timestamp(matchTime);
    let startTime = matchTs - 3600 * 24;
    let time = now < startTime ? startTime - now : 0;
    setTimeout(function() {
      fomo.activate(gameId, startTime)
        .then(data => {
          debug('fomo.activate response is %o', data);
        })
        .catch(err => {
          debug('fomo.activate err gameId: %d , startTime: %d', gameId, startTime);
          console.error(err);
        });
    }, time);
  };

  fomo.contract.events.onGameCreated({
    filter: {},
    fromBlock: 0,
  }, function(error, event) {
  })
  .on('data', function(event) {
    debug('onGameCreated data is %o', event);
    let gameId = event.returnValues.gameID;
    let timestamp = parseInt(event.returnValues.timestamp);
    if (timestamp + 3600 < du.getCurrentTimestamp()) {
      debug('past event gameId is %d, timestamp: %s', gameId, timestamp);
      return;
    }
    fomo.getGame(gameId)
      .then(data => {
        debug('fomo getGame data is %o', data);
        let eventId = parseInt(data.name);
        return app.models.Match.findOne({ where: { eventId } });
      })
      .then(match => {
        if (!match) {
          debug('gameId : %d not in db', gameId);
          return;
        }
        if (!match.isCreated) {
          match.updateAttributes({ isCreated: 1, gameId });
        }
        if (du.string2timestamp(match.time) > du.getCurrentTimestamp()) {
          activateTimer(gameId, match.time);
        }
      })
      .catch(err => {
        console.error(err);
      });
  })
  .on('changed', function(event) {
    // remove event from local database
  })
  .on('error', console.error);
};