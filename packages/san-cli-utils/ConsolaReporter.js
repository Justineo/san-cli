/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file consola reporter
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const figures = require('figures');
const chalk = require('chalk');
const stringWidth = require('string-width');
const {FancyReporter} = require('consola');
const {chalkColor, chalkBgColor} = require('./color');
const randomColor = require('./randomColor').color;

const RULES = [
    {
        type: 'Cant-find-module',
        re: /Cannot find module '(.+?)'/,
        msg: match => `Cannot find module: \`${match[1]}\``
    },
    {
        type: 'Type-error',
        re: /^([\.\w]+) is not a (\w+)$/,
        msg: match => `\`${match[1]}\` is not a ${match[2]}`
    },
    {
        type: 'Cant-read-property',
        re: /^Cannot read property '(.+)' of (\w+)$/,
        msg: match => `Cannot read property \`${match[1]}\` of ${match[2]}`
    }
];

const TYPE_ICONS = {
    info: figures('ℹ'),
    success: figures('✔'),
    debug: figures('›'),
    trace: figures('›'),
    error: figures('✖'),
    warning: figures('⚠'),
    warn: figures('⚠'),
    fatal: figures('☒'),
    log: ''
};
const TYPE_COLOR_MAP = {
    success: randomColor,
    info: randomColor,
    note: 'white',
    warn: 'yellow',
    warning: 'yellow',
    error: 'red',
    fatal: 'red'
};

const LEVEL_COLOR_MAP = {
    0: 'red',
    1: 'yellow',
    2: 'white',
    3: 'green'
};

/* eslint-disable operator-linebreak */
module.exports = class ConsolaReporter extends FancyReporter {
    formatType(logObj, isBadge) {
        const typeColor =
            logObj.badgeColor ||
            TYPE_COLOR_MAP[logObj.type] ||
            LEVEL_COLOR_MAP[logObj.level] ||
            this.options.secondaryColor;

        if (isBadge) {
            return chalkBgColor(typeColor).black(` ${logObj.type.toUpperCase()} `);
        }

        const tType =
            typeof TYPE_ICONS[logObj.type] === 'string' ? TYPE_ICONS[logObj.type] : logObj.icon || logObj.type;
        return tType ? chalkColor(typeColor)(tType) : '';
    }
    formatLogObj(logObj, {width}) {
        let [message, ...additional] = this.formatArgs(logObj.args).split('\n');
        const isBadge = typeof logObj.badge !== 'undefined' ? Boolean(logObj.badge) : logObj.level < 2;
        const secondaryColor = chalkColor(this.options.secondaryColor);
        const date = secondaryColor(
            logObj.date.toLocaleTimeString ? logObj.date.toLocaleTimeString() : this.formatDate(logObj.date)
        );

        const type = this.formatType(logObj, isBadge);

        const tag = logObj.tag ? secondaryColor(logObj.tag) : '';

        // 美化错误
        for (const {re, msg, type} of RULES) {
            const match = message.match(re);
            if (match) {
                message = msg(match);
            }
        }

        const formattedMessage = message.replace(/`([^`]+)`/g, (_, m) => chalk.cyan(m));

        let line;
        const left = this.filterAndJoin([type, formattedMessage]);
        const right = this.filterAndJoin([tag, date]);
        // 下面右对齐，跟 firendly error 的 log 对齐
        const space = width - stringWidth(left) - stringWidth(right);
        // const space = width - stringWidth(left) - stringWidth(right) - 2;

        if (space > 0 && width >= 80) {
            line = left + ' '.repeat(space) + right;
        } else {
            line = left;
        }

        line += additional.length ? '\n' + additional.join('\n') : '';

        return isBadge ? '\n' + line + '\n' : line;
    }
};
