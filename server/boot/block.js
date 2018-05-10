'use strict';

const blockSvc = require('../lib/block');
let debug = require('debug')('rand:boot:block');

module.exports = function(app) {
  let Block = app.models.Block;

  let scheduleGetInfo = function() {
    blockSvc.getInfo()
      .then(infos => {
        Block.create(infos.map(info => ({
          number: info.number,
          hash: info.hash,
        })))
          .then(() => {
            setTimeout(scheduleGetInfo, 60000);
          })
          .catch(err => {
            debug('schedule err: %O', err);
            setTimeout(scheduleGetInfo, 60000);
          });
      })
      .catch(err => {
        debug('schedule err: %O', err);
        setTimeout(scheduleGetInfo, 60000);
      });
  };

  Block.findOne({ order: 'number DESC' })
    .then(block => {
      if (block) {
        blockSvc.setTop(block.number);
      }

      scheduleGetInfo();
    });
};
