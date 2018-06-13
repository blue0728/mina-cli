#! /usr/bin/env node

var program = require('commander');
var fs = require('fs')
var path = require('path')
var notice = require('./notice')
var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);
var fileStr = fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8');
program
    .version(JSON.parse(fileStr).version)
    .option('create, --chdir <path>', '创建项目')
    .parse(process.argv);


if (program.chdir != '') {
    init();
}

function init() {
    var chdir = program.chdir;
    //判断创建文件夹
    fs.exists(chdir, function(exists) {
        if (!exists) {
            fs.mkdir(chdir, function(err) {
                if (err) {
                    notice.error('创建文件夹出错')
                    process.exit(0);
                } else {
                    notice.success(chdir + '文件夹【创建成功】')
                    var srcDir = path.resolve(__dirname, '../template/simple')
                    copyFolder(srcDir, chdir, function(err) {
                        if (err) {
                            notice.error(err)
                            return
                        }
                        notice.success('项目创建成功!')
                        notice.success('1.安装: cd ' + chdir + ' && npm install');
                        notice.success('2.运行: npm run dev')
                        notice.success('3.创建页面: npm run create')
                        process.exit(0);
                    })
                }
            })
        } else {
            notice.error(chdir + '文件夹【已存在】')
            process.exit(0);
        }
    })
}

var copyFolder = function(srcDir, tarDir, cb) {
    fs.readdir(srcDir, function(err, files) {
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