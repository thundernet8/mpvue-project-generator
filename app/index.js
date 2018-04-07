const Generator = require('yeoman-generator');
const pkg = require('../package.json');
const chalk = require('chalk');
const prompt = require('prompt');
const fs = require('fs');
const path = require('path');
const mkdir = require('mkdirp');
const prettier = require('prettier');
// const { getInstalledPathSync } = require("get-installed-path");
const unzip = require('unzip');

const prettierConfig = {
    tabWidth: 4,
    useTabs: false,
    singleQuote: false,
    bracketSpacing: true,
    parser: 'json'
};

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        // Next, add your custom code
        this.option('babel'); // This method adds support for a `--babel` flag

        // user options
        this.userOptions = {};
        this.hasError = false;
    }

    info() {
        console.log(chalk.cyan.bold(` ${pkg.name} v${pkg.version}`));
    }

    promptOptions() {
        const that = this;
        const done = this.async();

        prompt.message = chalk.gray(' question');
        prompt.delimiter = ':';
        prompt.start();

        prompt.get(
            {
                properties: {
                    name: {
                        description: chalk.white.bold('name'),
                        type: 'string',
                        pattern: /^[a-z0-9-_]+$/,
                        message: 'name must be lower-cased letters',
                        hidden: false,
                        replace: '*',
                        default: '',
                        required: true
                    },
                    description: {
                        description: chalk.white.bold('description'),
                        type: 'string',
                        default: '',
                        required: false
                    },
                    main: {
                        description: chalk.white.bold('main'),
                        type: 'string',
                        default: 'index.js',
                        required: false
                    },
                    author: {
                        description: chalk.white.bold('author (name <email>)'),
                        type: 'string',
                        default: '',
                        required: false
                    },
                    license: {
                        description: chalk.white.bold('license'),
                        type: 'string',
                        default: 'MIT',
                        required: false
                    }
                }
            },
            function(err, result) {
                if (err) {
                    if (err.message !== 'canceled') throw err;
                }
                that.userOptions = Object.assign(
                    {
                        version: '1.0.0',
                        description: '',
                        main: 'index.js',
                        author: '',
                        license: 'MIT'
                    },
                    result
                );
                done('');
            }
        );
    }

    mkFolder() {
        const folder = this.userOptions.name;
        if (fs.existsSync(folder)) {
            console.log(chalk.red.bold(`\n folder ${folder} was existed`));
            this.hasError = true;
            return false;
        }

        mkdir.sync(folder);
    }

    unzipFiles() {
        const folder = this.userOptions.name;
        fs
            .createReadStream('./archive.zip')
            .pipe(unzip.Extract({ path: path.resolve(process.cwd(), folder) }));
    }

    writePkg() {
        const folder = this.userOptions.name;
        const templatePkg = require(path.resolve(
            process.cwd(),
            folder,
            './archive/package.json'
        ));
        const json = Object.assign(templatePkg, this.userOptions);
        fs.writeFileSync(
            path.resolve(process.cwd(), folder + '/package.json'),
            prettier.format(JSON.stringify(json), prettierConfig)
        );
    }

    end() {
        if (this.hasError) {
            console.log(
                chalk.red.bold(`\n Fail init project ${this.userOptions.name}`)
            );
        } else {
            console.log(
                chalk.green.bold(
                    `\n Successfully init project ${this.userOptions.name}`
                )
            );
        }
    }
};