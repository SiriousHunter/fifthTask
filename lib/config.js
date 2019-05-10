"use strict";
const nconf = require('nconf')
var fs = require('fs');
nconf.argv()
    .env()
    .file({ file: './config.json' });


module.exports = nconf