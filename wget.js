'use strict';

let exec = require('child_process').execFile;

module.exports = (url, location, callback) => {
  // wget --quiet --continue --output-document=file
  exec('wget', ['--quiet', '--continue', `--output-document=${location}`, url], (err, stdout, stderr) => {
    if (err || stderr){
      console.log('ERROR', err, stderr);
    }
    callback && callback(err, stdout);
  })
}
