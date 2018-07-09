const sanitizeFilename = require('sanitize-filename');
const winston = require('winston');
const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');
const csvWriterMod = require('csv-writer');

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: 'scraper.log' }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

const now = moment();
const csvFilename = sanitizeFilename(`title-schedule-${now.format()}.csv`);
const csvFullPath = `output/${csvFilename}`;

const csvWriter = csvWriterMod.createObjectCsvWriter({
  path: csvFullPath,
  header: [
    { id: 'subject', title: 'Subject' },
    { id: 'startDate', title: 'Start Date' },
    { id: 'startTime', title: 'Start Time' },
    { id: 'endDate', title: 'End Date' },
    { id: 'endTime', title: 'End Time' },
    { id: 'allDayEvent', title: 'All Day Event' },
    { id: 'location', title: 'Location' },
  ],
});

const logError = (err) => {
  logger.error(err);
};

const classFilter = (c) => {
  /*
  const dayOfWeek = moment(c.startDate, 'MM/DD/YYYY').day();
  const hourOfDay = moment(c.startTime, 'h:mm A').hour();

  const isBoxing60 = c.subject.includes('Boxing 60');
  const isOutsideWork = ([0, 6].includes(dayOfWeek) || hourOfDay >= 17);

  if (isBoxing60 && isOutsideWork) return true;
  return false;
  */

  return true;
};

const parseData = (data) => {
  const $ = cheerio.load(data);

  const classes = [];

  const address1 = $('.address1').first().text();
  const address2 = $('.address2').first().text();
  const fullAddress = `${address1}${address2}`;

  function eachDay() {
    const classDateInput = $(this).find('h4 small').text();
    const classDate = moment(classDateInput, 'MMM D');

    classDate.year(now.year());

    if (now.month() === 11 && classDate.month() === 0) {
      classDate.add(1, 'y');
    }

    function eachClass() {
      const classTimeInput = $(this).find('p').eq(0).text();
      const classNameInput = $(this).find('p').eq(1).text();
      const trainerNameInput = $(this).find('p').eq(2).text();

      const minutesLong = classNameInput.substr(classNameInput.length - 2);

      const classStart = moment(`${classDate.format('YYYY-MM-DD')} ${classTimeInput}`, 'YYYY-MM-DD h:mm A');
      const classEnd = classStart.clone();

      classEnd.add(minutesLong, 'm');

      classes.push({
        subject: `${classNameInput} ${trainerNameInput}`,
        startDate: classStart.format('MM/DD/YYYY'),
        startTime: classStart.format('h:mm A'),
        endDate: classStart.format('MM/DD/YYYY'),
        endTime: classEnd.format('h:mm A'),
        allDayEvent: 'False',
        location: fullAddress,
      });
    }

    $(this).find('.schedule__item').each(eachClass);
  }

  $('.schedule__slider .slide').each(eachDay);

  csvWriter.writeRecords(classes.filter(classFilter))
    .then(() => { logger.info(`Classes written to ${csvFullPath}.`); }, logError);
};

const parseResponse = (res) => {
  if (res.status === 200) {
    parseData(res.data);
  } else {
    logger.error(`Response status: ${res.status}`);
  }
};

if (typeof process.argv[2] === 'undefined') {
  logger.error('Please specify a URL of a Title Boxing Club location homepage.');
} else {
  axios.get(process.argv[2]).then(parseResponse, logError);
}
