#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const program = require('commander')
const download = require('download-git-repo')
const handlebars = require('handlebars')
const inquirer = require('inquirer')
const ora = require('ora')
const logger = require('./logger')
const templatePre = 'mina-template'
const defaultTemplatName = templatePre + '-simple'
let userName = 'blue0728'
const sep = path.sep; //系统目录分隔符
let templateName = '',
    projectName = '';
let tmp = '';

program
    .version(require('../package').version)
    .option('init, <template-name>', '创建项目')
    .action(function(option) {
        init()
    })

program.parse(process.argv)


function init() {
    templateName = program.init; //模板名称路径
    projectName = program.args[0]; //项目名称
    if (templateName && projectName) {
        tmp = path.join(process.cwd(), projectName)

        if (projectName != undefined) {
            checkTemplateName();
        } else {
            logger.error('请输入项目目录：mina init ' + templateName + ' [项目目录]')
        }
    }
}


//检测模板路径
function checkTemplateName() {
    let templateNameArr = templateName.split('/');
    if (templateNameArr.length === 1) {
        templateName = templatePre + '-' + templateName
        if (templateName != defaultTemplatName) {
            logger.error('默认模板为' + defaultTemplatName + ' [mina init simple '+ projectName +']')
            return
        }
    } else {
        userName = templateNameArr[0]
        templateName = templateNameArr[1]
    }
    if (fs.existsSync(projectName)) {
        logger.error(projectName + '项目目录已存在')
    } else {
        writeProjectInfo()
    }
}


//填写项目名 appid
function writeProjectInfo() {
    inquirer.prompt([{
        name: 'name',
        message: '请输入项目名称'
    }, {
        name: 'appid',
        message: '请输入appId'
    }]).then((answers) => {
        if (answers.name != '' && answers.appid != '') {
            downLoadTemplate(answers)
        }
    })
}

//下载模板
function downLoadTemplate(answers) {

    const templaePath = path.join(userName, templateName)
    const spinner = ora('正在下载模板...')
    spinner.start()

    download(templaePath, tmp, function(err) {
        if (err) {
            spinner.fail()
            logger.error('下载' + templaePath + '模板失败')
        } else {
            spinner.succeed()
            logger.success('下载' + templaePath + '模板成功')
            const packageFile = path.join(tmp, 'package.json')
            const projectConfigFile = path.join(tmp, 'src/project.config.json')
            if (fs.existsSync(packageFile) && fs.existsSync(projectConfigFile)) {
                const packageFileContent = fs.readFileSync(packageFile).toString();
                const packageFileResutl = handlebars.compile(packageFileContent)(answers)
                fs.writeFileSync(packageFile, packageFileResutl)

                const projectConfigFileContent = fs.readFileSync(projectConfigFile).toString();
                const projectConfigFileResutl = handlebars.compile(projectConfigFileContent)(answers)
                fs.writeFileSync(projectConfigFile, projectConfigFileResutl)
                logger.success('项目' + projectName + '初始化成功')
            } else {
                logger.error('项目' + projectName + '初始化失败')
            }
        }
    })
}