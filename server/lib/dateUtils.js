'use strict';
let moment = require('moment');
const debug = require('debug')('rand:lib:dateUtils');

class DateUtils {
  /**
   * get today
   * @param {*} timezone
   * @param {*} format
   */
  getToday(timezone, format) {
    format = format || 'YYYYMMDD';
    return moment().utcOffset(60 * timezone).format(format);
  }
  /**
   * get yesterday
   * @param {*} timezone
   * @param {*} format
   */
  getYesterday(timezone, format) {
    format = format || 'YYYYMMDD';
    return moment().utcOffset(-60 * (24 - timezone)).format(format);
  }
  /**
   *  Get the start and end date of the first few weeks of the year
   * @param week
   * @param timezone
   * @param format 'YYYYMMDD'
   * @returns {{start: *, end: *}}
   */
  getThisYearDurationOfWeek(week, timezone, format) {
    timezone = timezone || 0;
    format = format || 'YYYYMMDD';
    let mut = moment().utcOffset(60 * timezone);
    let currentWeek = mut.format('WW');
    let index = currentWeek - week;
    let weekOfday = parseInt(mut.format('E')); // Calculating today is the first few days of the week
    debug('weekOfday is %d', weekOfday);
    let start = moment().utcOffset(60 * timezone)
      .subtract(weekOfday - 1 + index * 7, 'days').format(format); // monday
    let end = moment().utcOffset(60 * timezone)
      .subtract(weekOfday - 7 + index * 7, 'days').format(format); // sunday
    return { start, end };
  }
  /**
   * Get the year from the specified date to date
   * @param {*} fromDate
   * @param {*} timezone
   */
  getYearsByDate2Now(fromDate, timezone) {
    timezone = timezone || 0;
    let thisYear = moment().utcOffset(60 * timezone).format('YYYY');
    let fromYear = fromDate ? moment(fromDate).utcOffset(60 * timezone)
      .format('YYYY') : thisYear;
    return { fromYear, thisYear };
  }
  getDurationOfWeek(year, week, timezone, format) {
    timezone = timezone || 0;
    format = format || 'YYYYMMDD';
    let mut = moment(year + '-01-01').utcOffset(60 * timezone);
    let startWeek = mut.format('WW');
    let index = week - startWeek;
    let weekOfday = parseInt(mut.format('E')); // Calculating today is the first few days of the week
    debug('The first day weekOfday is %d', weekOfday);
    let start = moment(year + '-01-01').utcOffset(60 * timezone)
      .subtract(weekOfday - 1 - index * 7, 'days').format(format); // monday
    let end = moment(year + '-01-01').utcOffset(60 * timezone)
      .subtract(weekOfday - 7 - index * 7, 'days').format(format); // sunday
    return { start, end };
  }
  getDurationDays(from, to) {
    return moment.duration(moment(to) - moment(from)).as('days');
  }
  getTimeByHour(h, timezone = 8, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment().add('hours', h).utcOffset(60 * timezone).format(format);
  }
}

module.exports = DateUtils;
