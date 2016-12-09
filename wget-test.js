'use strict';

let n = 100;
let p = 100;

let path = require('path')
let shortid = require('shortid');
let async = require('async');
let wget = require('./wget');

let url = 'https://pimbox-storage.s3.amazonaws.com/pihl.jpg'

let t = Date.now();
async.timesLimit(n, p, (n, next) => {
  let id = shortid.generate();
  let out = path.join(__dirname, 'test-downloads', `dl-${id}.jpg`);
  // console.time(`${n} - ${id}`);
  wget(url, out, () => {
    // console.timeEnd(`${n} - ${id}`);
    next();
  })
}, () => {
  console.log('Done all');
  let f = Date.now();
  let totalTime = (f - t);
  console.log(`Total: ${totalTime / 1000} s`);

  let averageTime = totalTime / n;
  console.log(`Average: ${averageTime} ms`);
});
