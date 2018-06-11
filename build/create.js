//生成文件夹 以及 文件
//xx.js xx.json xx.wxml xx.wxss
//npm run create
var path = require('path');
var fs = require('fs');
var sep = path.sep; //系统目录分隔符
var str = '/pages/aaa/bbb/ccc'
var ext = ['js', 'json', 'wxml', 'wxss'];

create(str, function() {
    console.log('生成结束')
})

//创建
function create(dirPath, _callback) {
    if (typeof dirPath === 'string') {
        var path = dirPath;
        if (path[0] === '/') {
            path = path.substring(1); //去除路径前面的 /
        }
        var dirArr = path.split('/');
        dirArr.unshift('src'); //创建到src 目录下面
        var fileName = dirArr[dirArr.length - 1]; //取最后一个为文件名称
        dirArr.pop();
        var dir = sep + dirArr.join(sep);
        fs.exists(dir, function(exists) {
            if (!exists) {
                mkdir(0, dirArr, function() {
                    console.log('文件夹【全部创建完成】');
                    writeFile(dirArr.join(sep), fileName, _callback)
                })
            } else {
                console.log('文件夹【已存在】');
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
                    console.log('创建文件夹出错:', err)
                } else {
                    console.log(currentDir + '文件夹【创建成功】');
                    mkdir(pos + 1, dirArr, _callback)
                }
            })
        } else {
            console.log(currentDir + '文件夹【已存在】');
            mkdir(pos + 1, dirArr, _callback)
        }
    })
}

//创建文件
function writeFile(dirPath, fileName, _callback) {
    var len = ext.length;
    var fileArr = [];
    for (var i = 0; i < len; i++) {
        fileArr.push(path.join(dirPath, fileName + '.' + ext[i]));
    }
    write(0, fileArr, _callback)
}

//创建文件
function write(pos, fileArr, _callback) {
    var len = ext.length;
    if (pos >= len) {
        console.log('文件【全部创建成功】')
        _callback && _callback();
        return;
    }
    var fileNameNotes = fileArr[pos];
    switch (pos) {
        case 0:
            var fileStr = fs.readFileSync(path.join('template', 'template.js'), 'utf-8');
            fileNameNotes = '// ' + fileNameNotes + '\n' + fileStr;
            break;
        case 1:
            fileNameNotes = '{}'
            break;
        case 2:
            fileNameNotes = '<!--' + fileNameNotes + '-->'
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
            console.error(fileArr[pos] + '【已存在】');
            write(pos + 1, fileArr, _callback)
            return
        }
        write(pos + 1, fileArr, _callback)
    })
}