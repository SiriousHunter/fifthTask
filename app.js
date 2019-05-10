'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log = require('./lib/logger')(module);
var nconf = require('nconf');

var passport = require("passport");
var passportJWT = require("passport-jwt");


var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

//Настраиваем passport JWT
var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromHeader('token');
jwtOptions.secretOrKey = 'SUperSecret';
jwtOptions.ignoreExpiration = true

var strategy = new JwtStrategy(jwtOptions, async function (payload, next) {
    log.debug('payload received');

    let time = new Date().getTime()
    let expTime = payload.exp * 1000
    let user = payload

    if (expTime > time) {
        next(null, user);
    } else {
        next(null, false);
    }

});

passport.use(strategy);


var routes = require('./routes/index');

var app = express();


app.use(passport.initialize());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.sendStatus(err.status || 500);

    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.sendStatus(err.status || 500);

});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});
