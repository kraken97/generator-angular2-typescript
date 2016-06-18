'use strict';

var generators = require('yeoman-generator');
var yosay = require('yosay');
var path = require('path');
var _ = require('lodash');

var Generator = module.exports = generators.Base.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);

        this.log(yosay('Hello, and welcome to angular2-typescript generator!'));
        this.argument('appname', { type: String, required: false });
        this.appname = _.kebabCase(this.appname || path.basename(process.cwd()));

        this.pkg = require('../package.json');
        this.sourceRoot(path.join(__dirname, '../templates/'));
    }
});

Generator.prototype.askForCssFramework = function askForCssFramework() {
    return this.prompt([{
        type    : 'list',
        name    : 'cssFramework',
        message : 'Which CSS framework would you like to include?',
        choices: [{
            value   : 'bootstrap',
            name    : 'Bootstrap',
            checked : true
        }, {
            value   : 'foundation',
            name    : 'Foundation',
            checked : false
        }]
    }]).then(function(props) {
        this.cssFramework = props.cssFramework;
    }.bind(this));
};

Generator.prototype.askForModuleLoader = function askForModuleLoader() {
    return this.prompt([{
        type    : 'list',
        name    : 'moduleLoader',
        message : 'Which module loader would you like to use?',
        choices: [{
            value   : 'systemjs',
            name    : 'systemjs',
            checked : true
        }, {
            value   : 'webpack',
            name    : 'webpack',
            checked : false
        }]
    }]).then(function(props) {
        if(props.moduleLoader === 'webpack') {
            this.webpack = true;
        } else if(props.moduleLoader === 'systemjs') {
            this.systemjs = true;
        }
    }.bind(this));
};

Generator.prototype.askForAngularPackages = function askForAngularPackages() {
    return this.prompt([{
        type    : 'checkbox',
        name    : 'angularPackages',
        message : 'Which additional angular Packages would you like to include?',
        choices: [{
            value   : '@angular/http',
            name    : '@angular/http',
            checked : false
        }]
    }]).then(function(props) {
        this.angularPackages = props.angularPackages;
    }.bind(this));
};

Generator.prototype.writePackageFiles = function writePackageFiles() {
    this.template('root/.gitignore', '.gitignore');
    this.template('root/.editorconfig', '.editorconfig');
    this.template('root/tsconfig.json', 'tsconfig.json');

    this.template('root/_package.json', 'package.json', {
        appname: this.appname,
        pkg: this.pkg,
        webpack: this.webpack,
        systemjs: this.systemjs
    });

    this.template('root/_readme.md', 'readme.md', {
        appname: this.appname,
        pkg: this.pkg
    });

    this.template('root/_tslint.json', 'tslint.json', {
        appname: this.appname
    });

    this.template('root/_typings.json', 'typings.json', {
        appname: this.appname
    });

    if(this.systemjs) {
        var additionalPackages = [];

        this.angularPackages.forEach(function(p) {
            additionalPackages[p] = p;
        });

        this.template('root/systemjs.config.js', 'src/systemjs.config.js', {
            additionalPackages: additionalPackages
        });

        this.template('root/bs-config.json', 'bs-config.json');
    }

    this.template('src/index.html', 'src/index.html', {
        appname: this.appname
    });

    this.template('src/main.ts', 'src/main.ts');

    this.template('src/app/app.component.ts', 'src/app/app.component.ts');
    this.template('src/app/app.component.html', 'src/app/app.component.html');

    this.template('src/app/home/home.component.ts', 'src/app/home/home.component.ts');
    this.template('src/app/home/home.component.html', 'src/app/home/home.component.html');

    this.template('src/app/about/about.component.ts', 'src/app/about/about.component.ts');
    this.template('src/app/about/about.component.html', 'src/app/about/about.component.html');
};

Generator.prototype.installDependencies = function installDependencies() {
    var libraries = require('./libraries');
    var dependencies = _.union(libraries.angularDependencies, libraries.angularPackages, this.angularPackages);

    dependencies.push(this.cssFramework);

    this.npmInstall(dependencies, { 'save': true });
};
