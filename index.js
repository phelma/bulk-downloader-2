'use strict';

Error.stackTraceLimit = Infinity;


let inFile        = 'iacc.2.A.collection.xml';
let inFiles       = [
  'iacc.2.A.collection.xml',
  'iacc.2.B.collection.xml',
  'iacc.2.C.collection.xml'
];
// let inFile   = 'small.xml';
let outPath       = '/Volumes/SS1TB/Downloads3/';
let parallel      = 10;
let serverTimeout = 10 * 1000;
let totalTimeout  = 10 * 60 * 1000;

let parser        = require('xml2json');
let fs            = require('fs');
let async         = require('async');
let download      = require('download');
let path          = require('path');


let regex         = /\._-o-_\.(.*)/;

console.log('lets go');
console.time('downloaded all');

let getTheFiles = (file, callback) => {
  console.log('STARTING ' + file);
  fs.readFile(inFile, 'utf8', (err, res) => {
    let json = parser.toJson(res, {
      object: true
    });

    let videosList = json.VideoFileList.VideoFile;
    let count = 0;
    let total = videosList.length;

    console.log(`Downloading ${total} videos`);

    async.eachLimit(videosList, parallel, (video, done) => {
      let finished = false;

      let dlFileName = video.filename.match(regex)[1];
      let url = `${video.source}/${dlFileName}`;
      let outFilename = video.id;
      let n = ++ count;
      console.log(`${n} / ${total} - ${video.id} - Downloading`);
      console.time(`${n} / ${total} - ${video.id} - DONE`);

      setTimeout(() => {
        if (!finished) {
          console.timeEnd(`${n} / ${total} - ${video.id} - DONE`);
          console.log(`${n} / ${total} - ${video.id} - TIMED OUT WAITING FOR DOWNLOAD ${url}`);
          finished = true;
          done();
        }
      }, totalTimeout);

      download(url, outPath + outFilename, {
        timeout: serverTimeout
      }).then(() => {
          console.timeEnd(`${n} / ${total} - ${video.id} - DONE`);
          if (!finished){
            finished = true;
            done();
          }
        })
        .catch((err) => {
          console.timeEnd(`${n} / ${total} - ${video.id} - DONE`);
          console.error('ERROR', err);
          if (!finished) {
            finished = true;
            done();
          }
        });

    }, (err) => {
      console.timeEnd('FINISHED ' + file);
    })

  });
}

async.eachSeries(inFiles, (file, done) => {
  getTheFiles(file, done);
}, (err) => {
  console.timeEnd('downloaded all');
  console.log('DONE THEM ALL');
});
