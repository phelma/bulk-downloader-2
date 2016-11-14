'use strict';

let parser = require('xml2json');
let fs = require('fs');
let async = require('async');
let download = require('download');

let outPath = __dirname + '/download/';

let regex = /\._-o-_\.(.*)/;

let xml = fs.readFile('small.xml', 'utf8', (err, res) => {
  let json = parser.toJson(res, {
    object: true
  });

  async.eachLimit(json.VideoFileList.VideoFile, 4, (video, done) => {
    let fileName = video.filename.match(regex)[1];
    let url = `${video.source}/${fileName}`;
    console.log('downloading ' + url);
    download(url, outPath).then(() => {
      console.log('finished ' + url);
      done();
    })
  }, (err) => {
    console.log('downloaded all');
  })

});
