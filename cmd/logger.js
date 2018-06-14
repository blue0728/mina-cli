const chalk = require('chalk')
const symbols = require('log-symbols')


exports.error = function(msg) {
    console.log(symbols.error, chalk.red(msg))
}

exports.success = function(msg) {
    console.log(symbols.success, chalk.green(msg))
}