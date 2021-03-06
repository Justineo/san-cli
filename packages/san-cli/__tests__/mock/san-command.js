/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file customize command
 * @author yanyiting <yanyiting@baidu.com>
 */

exports.command = 'hello';
exports.builder = {
    name: {
        type: 'string'
    }
};
exports.desc = 'San Command Plugin Demo';
exports.handler = argv => {
    console.log(`hello, ${argv.name}`);
};
