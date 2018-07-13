# Title Schedule Scraper

Scrapes the latest schedule from Title's website and outputs CSV data ready for import into Google
Calendar.

Title Boxing Club is a fitness gym that holds trainer-led classes daily. On their website, each
location has its own "homepage." You can find the schedule for the next 11-12 days on this page.
This is the only way to access the schedule online. There is no iCal or alternative version.

If you feed this module a location's homepage URL (for example:
https://titleboxingclub.com/chicago-south-loop-il/), it will pull the available schedule and
automatically create a CSV file.

The output can be saved to a file and [imported into Google
Calendar](https://support.google.com/calendar/answer/37118?hl=en).

## Installation

    > git clone https://github.com/travishorn/title-schedule-scraper.git
    > npm install

## Usage

1. Go to https://titleboxingclub.com
2. Enter your zip or city and state in the search bar
3. Click your location
4. Copy the URL

Once you have the URL, simply run...

    > node index [options] <url>

### Options:

    -V, --version             output the version number
    -c, --class <name>        Only include the specified class type (ex: Boxing)
    -d, --duration <minutes>  Only include classes that last the specified number of minutes (ex: 60)
    -t, --trainer <name>      Only include the specified trainer (ex: Jordan)
    -h, --help                output usage information

### Example

    > node index -c Boxing -d 60 -t Jordan https://titleboxingclub.com/chicago-south-loop-il/

This command will output CSV data to the terminal. You can pipe this data to file like so:

    > node index https://titleboxingclub.com/chicago-south-loop-il/ > title-schedule.csv

## Looking forward

One better solution may be to scrape the schedule and serve iCal data from a server. The issue with
this method would be that your connected calendar app would need to always have access to the URL.
Meaning you would have to self-host an always-running server, or host it in the cloud. If hosting in
the cloud, the HTML scraping portion of the module may violate certain terms of service.

Another nice feature would be a way to specify your schedule (work, school, etc) so that you can
"black out" certain days and times of the week. The CSV output would then only

## License

The MIT License (MIT)

Copyright (c) 2018 Travis Horn

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
