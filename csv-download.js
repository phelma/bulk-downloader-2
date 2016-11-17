'use strict';

// Error.stackTraceLimit = Infinity;
let longjohn = require('longjohn');
longjohn.async_trace_limit = -1;  // unlimited

let inFile        = '18k_download.csv';
let inFiles = [inFile];
let outFile       = __dirname + '/download/';

let parallel      = 30;
let serverTimeout = 5 * 1000; // 5 seconds
let totalTimeout  = 10 * 1000; // 10 sec

let parse         = require('csv-parse');
let fs            = require('fs');
let async         = require('async');
let download      = require('download');
let path          = require('path');
let got           = require('got');
let request       = require('request');
let mkdirp        = require('mkdirp');

console.log('lets go');
console.time('downloaded all');


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

          request
            .get(url)
            .on('error', (err) => {
              console.log('error', err);
            })
            .pipe(fs.createWriteStream(outFilename))
            .on('finish', (res) => {
              let now = Date.now();
              let diff = now - start;
              let n = ++ count;
              let avg = diff / count;
              console.log('done', n);
              console.log('AVERAGE TIME', avg);
              done();
            });
        })


        // setTimeout(() => {
        //   if (!finished) {
        //     finished = true;
        //     done();
        //     console.timeEnd(`${n} / ${total} - DONE`);
        //     console.log(`${n} / ${total} - TIMED OUT WAITING FOR DOWNLOAD ${url}`);
        //   }
        // }, totalTimeout);

        // got.stream(url, {timeout: 5000})
        //   .pipe(fs.createWriteStream(outFilename))
        //   // .on('request', req => setTimeout(() => req.abort(), 10000))
        //   .on('error', err => {
        //     console.error('ERROR', err);
        //   })
        //   .on('finish', res => {
        //     console.log('done');
        //     done();
        //   })
        // ;





        // download(url, outFilename, {
        //   timeout: serverTimeout
        // }).then(() => {
        //     console.log('THEN', finished);
        //     if (!finished){
        //       finished = true;
        //       done();
        //       console.timeEnd(`${n} / ${total} - DONE`);
        //     }
        //   })
        //   .catch((err) => {
        //     console.log('CATCH', finished);
        //     if (!finished) {
        //       finished = true;
        //       done();
        //       console.timeEnd(`${n} / ${total} - DONE`);
        //     }
        //     console.error('ERROR', err);
        //   });

      }, (err) => {
        console.timeEnd('FINISHED ' + file);
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
