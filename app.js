#!/usr/bin/env node
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var randomstring = require('randomstring');
var fs = require('fs');
var shortid = require('shortid');
var walk = require('walk')
var archiver = require('archiver');

try {
 fs.unlinkSync('./key.js');
} catch (e) {}

fs.writeFileSync('./key.js', `module.exports = "${randomstring.generate(42)}";`);

const key = require('./key');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(require('node-sass-middleware')({
//   src: path.join(__dirname, 'public'),
//   dest: path.join(__dirname, 'public'),
//   indentedSyntax: true,
//   sourceMap: true
// }));
// app.use(express.static(path.join(__dirname, 'public')));
let paths = {};
app.post('/add', (req, res, next) => {
  if (req.body.auth_key !== key) {
    return res.status(403).send({message: 'Auth key invalid'});
  }
  if (!fs.existsSync(req.body.path)) {
    return res.status(405).send({message: 'File folder not found'});
  }
  let id = shortid.generate(), auth = randomstring.generate(21);
  paths[id] = {
    path: req.body.path,
    auth: auth
  };
  res.status(201).send({id: id, auth: auth,
  url: 'localhost:2986/'+id+'/'+auth
});
});
app.get('/:id/:auth', (req, res, next) => {
  let p = paths[req.params.id];
  if (!p) return res.status(404).send({message: 'id does not exist'});
  if (p.auth !== req.params.auth) return res.status(403).send({message: 'auth incorrect'});
  if (fs.lstatSync(p.path).isDirectory()) {
    res.setHeader('content-type', 'application/octet-stream');
    res.setHeader('content-disposition', `inline; filename="${p.path.replace(/^.*[\\\/]/, '')}.zip"`)
    var archive = archiver('zip', {
        store: true // Sets the compression method to STORE.
    });

    // listen for all archive data to be written
    archive.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
      throw err;
    });
    archive.pipe(res);
    walker = walk.walk(p.path, {});
    walker.on('file', (root, fileStats, next) => {
      let f = path.join(root, fileStats.name);
      let name = f.substr(p.path.length, f.length + 1);
      console.log('Adding file ' + f, name);
      archive.file(f, {name: name});
      next();
    })
    walker.on('end', () => archive.finalize());

  } else {
    res.setHeader('content-type', 'application/octet-stream');
    res.setHeader('content-disposition', `inline; filename="${p.path.replace(/^.*[\\\/]/, '')}"`)
    fs.createReadStream(p.path).pipe(res);
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
app.listen(2986, function() {
  console.log('Listenning port 2986');
})
