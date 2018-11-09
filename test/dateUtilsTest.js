'use strict';

let request = require('supertest');
let should = require('should');
let moment = require('moment');
const DateUtils = require('../server/lib/dateUtils');
let du = new DateUtils();

// http://momentjs.com/docs/
describe('dateUtils', function() {
  before(function(done) {
    done();
  });
  it('test getToday', function(done) {
    let today = du.getToday(8, 'MMDD');
    console.log('today is %s', today);
    done();
  });
  it('test getYesterday', function(done) {
    let yesterday = du.getYesterday(8, 'MMDD');
    console.log('yesterday is %s', yesterday);
    done();
  });
  it('test getThisYearDurationOfWeek', function(done) {
    let { start, end } = du.getThisYearDurationOfWeek(37, 8, 'MMDD');
    console.log('start is %s, end is %s', start, end);
    done();
  });
  it('test getYearsByDate2Now', function(done) {
    let { fromYear, thisYear } = du.getYearsByDate2Now('2016-08-06', 8);
    console.log('fromYear is %s, thisYear is %s', fromYear, thisYear);
    for (let year = fromYear; year <= thisYear; year ++) {
      console.log(year);
    }
    done();
  });
  it('test getDurationOfWeek', function(done) {
    let { start, end } = du.getDurationOfWeek('2018', '38', 8);
    console.log('start is %s, end is %s', start, end);
    done();
  });
  it('test diff', function(done) {
    let start = '2018-10-11 10:00:00';
    let end = '2018-10-12 00:00:00';
    let diff = moment().diff(start);
    console.log('diff is %s', diff);
    let di = moment.duration(moment(end) - moment(start)).as('days');
    console.log(di > 1);
    done();
  });
  it('test htime', function(done) {
    let time = du.getTimeByHour(2);
    console.log(time);
    done();
  });
  it('test days', function(done) {
    let time = du.getTimeByDay(2);
    console.log(time);
    done();
  });
  it('test string2timestamp', function(done) {
    let time = du.string2timestamp('2018-11-07 20:00');
    console.log(time);
    done();
  });
});

