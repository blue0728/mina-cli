#! /usr/bin/env node

var program = require('commander');
var fs = require('fs')
var path = require('path')
var notice = require('./notice')
var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);

program
    .version('1.0.0')
    .option('-v, --version', '版本号')
    .option('-i, --init', '初始化项目')
    .action(function(res) {
        console.log(res)
        notice.success('开始初始化项目')
        init()
    })
    .parse(process.argv);


function init() {

    rl.setPrompt('输入项目名称，输入Q退出>');
    rl.prompt();

    rl.on('line', (line) => {
        if (line.trim().toUpperCase() === 'Q') {
            process.exit(0);
        } else {
            //判断创建文件夹
            fs.exists(line, function(exists) {
                if (!exists) {
                    fs.mkdir(line, function(err) {
                        if (err) {
                            notice.error('创建文件夹出错')
                            process.exit(0);
                        } else {
                            notice.success(line + '文件夹【创建成功】')
                            copyFolder(path.join('template', 'simple'), line, function(err) {
                                if (err) {
                                    notice.error(err)
                                    return
                                }
                                notice.success('项目创建成功: cd ' + line + ' & npm install')
                                process.exit(0);
                            })
                        }
                    })
                } else {
                    notice.error(line + '文件夹【已存在】')
                    process.exit(0);
                }
            })
        }
    });
}

var copyFolder = function(srcDir, tarDir, cb) {
    console.log(path.join(process.cwd(), srcDir)
    fs.readdir(path.join(process.cwd(), srcDir), function(err, files) {
        console.log(files)
        var count = 0
        var checkEnd = function() {
            ++count == files.length && cb && cb()
        }

        if (err) {
            checkEnd()
            return
        }

        files.forEach(function(file) {
            var srcPath = path.join(srcDir, file)
            var tarPath = path.join(tarDir, file)

            fs.stat(srcPath, function(err, stats) {
                if (stats.isDirectory()) {
                    notice.success(tarPath)
                    fs.mkdir(tarPath, function(err) {
                        if (err) {
                            notice.error(err)
                            return
                        }

                        copyFolder(srcPath, tarPath, checkEnd)
                    })
                } else {
                    copyFile(srcPath, tarPath, checkEnd)
                }
            })
        })

        //为空时直接回调
        files.length === 0 && cb && cb()
    })
}

var copyFile = function(srcPath, tarPath, cb) {
    var rs = fs.createReadStream(srcPath)
    rs.on('error', function(err) {
        if (err) {
            notice.error(srcPath + '【读取文件出错】')
        }
        cb && cb(err)
    })

    var ws = fs.createWriteStream(tarPath)
    ws.on('error', function(err) {
        if (err) {
            notice.error(tarPath + '【写入文件出错】')
        }
        cb && cb(err)
    })
    ws.on('close', function(ex) {
        cb && cb(ex)
    })

    rs.pipe(ws)
}