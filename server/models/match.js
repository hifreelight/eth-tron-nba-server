'use strict';

module.exports = function(Match) {
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
};
