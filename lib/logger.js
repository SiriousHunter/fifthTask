'use strict';
var winston = require('winston');
const { format } = require('logform');
var ENV = process.env.NODE_ENV

module.exports = function (module) {
    return makeLogger(module);
};



function makeLogger(module) {
    let path = module.filename.split('\\').slice(-2).join('\\')

    var transports = [
        new winston.transports.Console({
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                format.label({ label: path, }),
                format.printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`)
            ),
            level: (!ENV || ENV === 'development') ? 'debug' : 'error'
        }),

        new winston.transports.File({
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                format.label({ label: path, }),
                format.printf(info => `${info.timestamp} [ ${info.label} ] ${info.level}: ${info.message}`)
            ),

            filename: 'debug.log',
            level: (!ENV || ENV === 'development') ? 'debug' : 'info'
        })
    ];

    return winston.createLogger({
        transports: transports
    });

}