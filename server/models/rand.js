'use strict';

let RandSvc = require('../lib/rand');

module.exports = function(Rand) {
  Rand.generate = function(type, min, max, count, cb) {
    if (type !== 'integer' && !(type !== 'array' || count >= 0)) {
      return cb(new Error('not supported type'));
    }

    let Block = Rand.app.models.Block;
    Block.findOne({ order: 'number DESC', fields: { used: false } })
      .then(info => {
        if (!info) {
          // TODO: handle no
          return cb(new Error('no seeds'));
        }

        let svc = new RandSvc(info);

        if (type === 'integer') {
          return cb(null, svc.integer(min, max));
        } else if (type === 'array') {
          return cb(null, svc.array(count, min, max));
        }
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
