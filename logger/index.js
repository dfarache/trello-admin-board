const config = require('./config'),
    bunyanLogger = require('express-bunyan-logger');

module.exports = class Logger {

    constructor(app){
        app.use(bunyanLogger(config.request));
        app.use(bunyanLogger.errorLogger(config.error));
    }

}
