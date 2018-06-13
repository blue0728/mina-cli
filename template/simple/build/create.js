/*
 * 生成文件夹 以及 文件
 * npm run create
 * example  /pages/aa/bb/cc/dd/文件名
 * xx.js xx.json xx.wxml xx.wxss
 */

var readline = require('readline');
var notice = require('./notice')
var path = require('path');
var fs = require('fs');
var sep = path.sep; //系统目录分隔符
var ext = ['js', 'json', 'wxml', 'wxss'];
var rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt('输入路径(例：/pages/home/home/文件名)，输入Q退出>');
rl.prompt();

rl.on('line', (line) => {
    if (line.trim().toUpperCase() === 'Q') {
        process.exit(0);

    } else {
        create(line.trim(), function() {
            notice.success('success')
            process.exit(0);
        })
    }
});

//创建
function create(dirPath, _callback) {
    if (typeof dirPath === 'string') {
        var spath = dirPath;
        if (spath[0] === '/') {
            spath = spath.substring(1); //去除路径前面的 /
        }
        var dirArr = spath.split('/');
        dirArr.unshift('src'); //创建到src 目录下面
        var fileName = dirArr[dirArr.length - 1]; //取最后一个为文件名称
        dirArr.pop();
        var dir = sep + dirArr.join(sep);
        fs.exists(dir, function(exists) {
            if (!exists) {
                mkdir(0, dirArr, function() {
                    notice.success('---------文件夹【全部创建完成】')
                    writeFile(dirArr.join(sep), spath, fileName, _callback)
                })
            } else {
                notice.error('文件夹【已存在】')
                _callback && _callback();
            }
        })
    }
}

//创建目录
function mkdir(pos, dirArr, _callback) {
    var len = dirArr.length;
    if (pos >= len || pos > 10) {
        _callback && _callback();
        return;
    }
    var currentDir = '';
    for (var i = 0; i <= pos; i++) {
        if (i != 0) {
            currentDir += sep;
        }
        currentDir += dirArr[i];
    }
    fs.exists(currentDir, function(exists) {
        if (!exists) {
            fs.mkdir(currentDir, function(err) {
                if (err) {
                    notice.error('创建文件夹出错')
                } else {
                    notice.success(currentDir + '文件夹【创建成功】')
                    mkdir(pos + 1, dirArr, _callback)
                }
            })
        } else {
            notice.error(currentDir + '文件夹【已存在】')
            mkdir(pos + 1, dirArr, _callback)
        }
    })
}

//创建文件
function writeFile(dirPath, spath, fileName, _callback) {
    var len = ext.length;
    var fileArr = [];
    for (var i = 0; i < len; i++) {
        fileArr.push(path.join(dirPath, fileName + '.' + ext[i]));
    }
    write(0, fileArr, spath, _callback)
}

//创建文件
function write(pos, fileArr, spath, _callback) {
    var len = ext.length;
    if (pos >= len) {
        notice.success('--------文件【全部创建成功】')
        editAppjson(spath, _callback)
        return;
    }
    var fileNameNotes = fileArr[pos];

    switch (pos) {
        case 0:
            var fileStr = fs.readFileSync(path.join('build', 'template.js'), 'utf-8');
            fileNameNotes = '// ' + fileNameNotes + '\n' + fileStr;
            break;
        case 1:
            fileNameNotes = '{}'
            break;
        case 2:
            fileNameNotes = '<!--' + fileNameNotes + '-->\n<view>' + fileNameNotes + '</view>'
            break;
        case 3:
            fileNameNotes = '/* ' + fileNameNotes + ' */'
            break;
        default:
    }

    fs.writeFile(fileArr[pos], fileNameNotes, {
        flag: 'wx'
    }, function(err) {
        if (err) {
            notice.error(fileArr[pos] + '【已存在】')
            write(pos + 1, fileArr, spath, _callback)
            return
        }
        notice.success(fileArr[pos] + '【创建成功】')
        write(pos + 1, fileArr, spath, _callback)
    })
}

//增加app.json pages 路径配置
function editAppjson(dirPath, _callback) {
    var fileStr = path.join('src', 'app.json')
    fs.readFile(fileStr, 'utf-8', function(err, res) {
        if (err) {
            notice.error(fileStr + '【读取失败】')
        }
        var json = JSON.parse(res);
        if (json.pages.indexOf(dirPath) == -1) {
            json.pages.push(dirPath)
        }
        //然后再把数据写进去
        fs.writeFile(fileStr, JSON.stringify(json), 'utf-8', function(err) {
            if (err) {
                notice.error(fileStr + '【更新失败】')
            }
            notice.success(fileStr + '【更新成功】')
            _callback && _callback();
        })
    })
}