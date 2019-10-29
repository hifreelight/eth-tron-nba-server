'use strict';
const fomoTron = require('../lib/betTownFomoTron');
const debug = require('debug')('rand:boot:betTownFomoTron');
const DateUtils = require('../lib/dateUtils');
let du = new DateUtils();

module.exports = function(app) {
  let activateTimer = function(gameId, matchTime) {
    let now = du.getCurrentTimestamp();
    let matchTs = du.string2timestamp(matchTime);
    let startTime = matchTs - 3600 * 24 - 3600 * 8;
    let time = now < startTime ? startTime - now : 0;
    debug('gameId: %d, now: %d, matchTs: %d, startTime: %d, time: %d', gameId, now, matchTs, startTime, time);
    setTimeout(function() {
      fomoTron.activate(gameId, startTime)
        .then(data => {
          debug('fomoTron.activate response is %o', data);
        })
        .catch(err => {
          debug('fomoTron.activate err gameId: %d , startTime: %d', gameId, startTime);
          console.error(err);
        });
    }, time * 1000);
  };
  let onGameCreated = () => {
    fomoTron.contract.onGameCreated().watch((err, data)=> {
      if (!data) {
        // debug('onGameCreated data is null or undefined');
        return;
      }
      let { result } = data;
      if (err) return console.error('Failed to bind event listener:', err);
      if (!result) {
        console.error('onGameCreated watch result is null');
        return;
      }
      const tronGameId = result.gameID;
      const timestamp = parseInt(result.timestamp);
      if (timestamp + 3600 * 24 < du.getCurrentTimestamp()) {
        debug('onGameCreated past event tronGameId is %d, timestamp: %s', tronGameId, timestamp);
        return;
      }
      fomoTron.getGame(tronGameId)
        .then(data => {
          debug('fomoTron getGame data is %o', data);
          let eventId = parseInt(data.name);
          return app.models.Match.findOne({ where: { eventId } });
        })
        .then(match => {
          if (!match) {
            debug('tronGameId : %d not in db', tronGameId);
            return;
          }
          if (!match.tronIsCreated) {
            match.updateAttributes({ tronIsCreated: 1, tronGameId });
          }
          if (!match.tronIsActivate && du.string2timestamp(match.time) > du.getCurrentTimestamp()) {
            activateTimer(tronGameId, match.time);
          }
        })
        .catch(err => {
          console.error('onGameCreated getGame err is %o', err);
        });
    });
  };

  let onGameActivated = () => {
    fomoTron.contract.onGameActivated().watch((err, data)=> {
      if (!data) {
        debug('onGameActivated data is null or undefined');
        return;
      }
      let { result } = data;
      if (err) return console.error('Failed to bind event onGameActivated listener:', err);
      if (!result) {
        console.error('onGameCreated watch result is null');
        return;
      }
      debug('onGameActivated data is %o', result);
      let tronGameId = result.gameID;
      let timestamp = parseInt(result.timestamp);
      if (timestamp + 3600 * 24 < du.getCurrentTimestamp()) {
        debug('onGameActivated past event tronGameId is %d, timestamp: %s', tronGameId, timestamp);
        return;
      }
      app.models.Match.findOne({ where: { tronGameId } })
        .then(match => {
          if (!match) {
            debug('onGameActivated tronGameId : %d not in db', tronGameId);
            return;
          }
          if (!match.tronIsActivate) {
            match.updateAttributes({ tronIsActivate: 1 });
          }
        })
        .catch(err => {
          console.error(err);
        });
    });
  };
  onGameCreated();
  onGameActivated();
  fomoTron.on('fomoTron tron listning', function() {
    onGameCreated();
    onGameActivated();
  });
};
