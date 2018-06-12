var colors = require('colors');

var notice = {
    success(str) {
        return console.log((str).green)
    },
    error(str) {
        return console.log((str).red)
    },
    warn(str) {
        return console.log((str).yellow)
    }
}

module.exports = notice;