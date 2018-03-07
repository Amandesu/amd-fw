'use strict';
// 当前为开发环境
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';


const fs = require('fs');
const path = require("path");
const chalk = require('chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../config/webpack.dev.config');
const paths = require('../config/paths');

webpackConfig.entry.unshift("webpack-dev-server/client?http://localhost:8080/");
const compiler = webpack(webpackConfig);

const server = new WebpackDevServer(compiler, {
    hot:true,
    //contentBase: paths.appPublic,
    //watchContentBase:true,
    //publicPath:webpackConfig.output.publicPath
})
server.listen(8080);
