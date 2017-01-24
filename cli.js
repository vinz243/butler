#!/usr/bin/env node
const request = require('request');
const fs = require('fs');

let p = process.argv[2];
if (fs.existsSync(p)) {
  request.post({headers: {'content-type' : 'application/x-www-form-urlencoded'},
      url:     'http://localhost:2986/add',
      body:    `auth_key=${require('./key')}&path=${encodeURIComponent(p)}`
  }, (err, response, body) => {
    if(err) return console.log(err);
    if (body.message) return console.log(body.message);

    let url = body;
    console.log('Returned', url);
  });
} else {
  console.log('Path does not exists');
}
