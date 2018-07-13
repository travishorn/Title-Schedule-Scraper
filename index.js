const program = require('commander');
const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');
const csvWriterMod = require('csv-writer');

const now = moment();
let url = null;

const csvWriter = csvWriterMod.createObjectCsvStringifier({
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
  process.stderr.write(err);
};

const classFilter = (c) => {
  const parts = c.subject.split(' ');
  const classType = parts[0].trim().toUpperCase();
  const duration = parts[1].trim();
  const trainer = parts[2].trim().toUpperCase();

  if (program.class && classType !== program.class.toUpperCase()) return false;
  if (program.duration && duration !== program.duration) return false;
  if (program.trainer && trainer !== program.trainer.toUpperCase()) return false;

  /*
  const dayOfWeek = moment(c.startDate, 'MM/DD/YYYY').day();
  const hourOfDay = moment(c.startTime, 'h:mm A').hour();

  const isOutsideWork = ([0, 6].includes(dayOfWeek) || hourOfDay >= 17);

  if (!isOutsideWork) return false;
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

  process.stdout.write(csvWriter.getHeaderString());
  process.stdout.write(csvWriter.stringifyRecords(classes.filter(classFilter)));
};

const parseResponse = (res) => {
  if (res.status === 200) {
    parseData(res.data);
  } else {
    process.stderr.write(`Response status: ${res.status}`);
  }
};

program
  .version('2.0.0')
  .usage('[options] <url>')
  .option('-c, --class <name>', 'Only include the specified class type (ex: Boxing)')
  .option('-d, --duration <minutes>', 'Only include classes that last the specified number of minutes (ex: 60)')
  .option('-t, --trainer <name>', 'Only include the specified trainer (ex: Jordan)')
  .arguments('<url>')
  .action((urlValue) => {
    url = urlValue;
  })
  .parse(process.argv);

if (!url) {
  process.stderr.write('Please specify a URL of a Title Boxing Club location homepage.');
} else {
  axios.get(url).then(parseResponse, logError);
}
