'use strict';

let exec = require('child_process').execFile;

module.exports = (url, location, callback) => {
  exec('wget', ['--quiet', '--continue', `--output-document=${location}`, url], (err, stdout, stderr) => {
    callback && callback(err, stdout);
  })
}
