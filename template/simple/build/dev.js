var callfile = require('child_process');
var config = require('./config');
var path = require('path');
var colors = require('colors');

var projectPath = path.join(process.cwd(), 'dist');

callfile.execFile(`${config.path}/Contents/Resources/app.nw/bin/cli`, ['-o', projectPath], (err, stdout, stderr) => {
    
    if (err) {
        console.log(('打开失败：\n' + err).red)
        return
    }
    if (stderr) {
        console.log(('工具内报错\n' + stderr).red)
        return
    }
    console.log(('工具打开成功 \n' + stdout).green)

})
