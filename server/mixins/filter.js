'use strict';

const debug = require('debug')('mixins:scope');

module.exports = function(Model, options) {
  Model.observe('access', function event(ctx, next) { // Observe any insert/update event on Model
    let limit = options.limit || 100;
    if (ctx.query) {
      if (ctx.query.limit) {
        if (ctx.query.limit > limit) {
          ctx.query.limit = limit;
        }
      } else {
        ctx.query.limit = limit;
      }
      debug('hook filter ctx.query.limit is %d', ctx.query.limit);
    }
    next();
  });
};

