'use strict';

Error.stackTraceLimit = Infinity;

let parallel      = 10;
let inFile        = '18k_download.csv';
let inFiles       = [inFile];
let outFile       = __dirname + '/download/';

let path          = require('path');
let fs            = require('fs');

let parse         = require('csv-parse');
let async         = require('async');
let mkdirp        = require('mkdirp');

let wget = require('./wget');

console.log('lets go');
console.time('downloaded all');

let errors = 0;

let getTheFiles = (file, callback) => {
  console.log('STARTING ' + file);
  fs.readFile(inFile, 'utf8', (err, res) => {

    parse(res, (err, out) => {
      let start = Date.now();
      let fileList = out;
      let count = 0;
      let total = fileList.length;

      console.log(`Downloading ${total} files`);

      async.eachLimit(fileList, parallel, (file, done) => {
        let finished = false;

        let dlFileName = file[1].split('\\').join('/');
        let url = file[0];
        let outFilename = outFile + dlFileName;
        let outDirname = path.dirname(outFilename);
        mkdirp(outDirname, () => {
          // console.log(`${n} / ${total} - Downloading`);
          // console.time(`${n} / ${total} - DONE`);

          wget(url, outFilename, (err) => {
              if (err){
                errors ++;
              } else {
                let now = Date.now();
                let diff = now - start;
                let n = ++ count;
                if (n % 10 === 0){
                  let avg = diff / count;
                  console.log(`Done: ${n}, Failed: ${errors}`);
                  console.log('AVERAGE TIME', avg);
                }
              }
              done();

          })

        })

      }, (err) => {
        console.timeEnd('FINISHED ' + file);
        console.log('ERRORS: ' + errors);
      })

    })

  });
}

async.eachSeries(inFiles, (file, done) => {
  getTheFiles(file, done);
}, (err) => {
  console.timeEnd('downloaded all');
  console.log('DONE THEM ALL');
});
