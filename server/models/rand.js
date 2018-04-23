'use strict';

let RandSvc = require('../lib/rand');
let debug = require('debug')('rand:models:rand');
let forwardTime = 20; //minutes

module.exports = function(Rand) {
  Rand.generate = function(type, min, max, count, cb) {
    if (type !== 'integer' && !(type !== 'array' || count >= 0)) {
      return cb(new Error('not supported type'));
    }

    let Block = Rand.app.models.Block;
    Block.findOne({ where: {used: false}, order: 'number DESC' })
      .then(info => {
        if (!info) {
          // TODO: handle no
          let now = new Date().getTime();
          console.error(`add block infos have been used. now try to set block infos to unused before ${forwardTime} minutes.`);
          return Block.updateAll({where: {used: false, time: {lt: now - 1000 * 60 * forwardTime}}, order: 'number DESC', limit: 1000}, {used: false})
            .then(function(data) {
              return Block.findOne({ where: {used: false}, order: 'number DESC' })
                .then(info => {
                  if (!info) {
                    return cb(new Error('no seeds'));
                  }
                  return info;
                })
                .catch(err => cb(err));
            })
            .catch(err => cb(err));
        }
        return info;
      })
      .then(info => {
        info.used = true;
        return Block.updateAll({number: info.number}, info)
        .then(_count => {
          let svc = new RandSvc(info);

          if (type === 'integer') {
            return {result: svc.integer(min, max), blockNumber: svc.blockNumber};
          } else if (type === 'array') {
            return {result: svc.array(count, min, max), blockNumber: svc.blockNumber};
          }
        })
        .catch(err => cb(err));
      })
      .then(result => {
        return cb(null, result);
      })
      .catch(err => cb(err));
  };

  Rand.remoteMethod('generate', {
    http: {
      path: '/',
      verb: 'get',
    },
    accepts: [
      { arg: 'type', type: 'string' },
      { arg: 'min', type: 'number' },
      { arg: 'max', type: 'number' },
      { arg: 'count', type: 'number' },
    ],
    returns: { root: true, type: 'Rand' },
  });
};
