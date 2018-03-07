'use strict';

const path = require('path');
const fs = require('fs');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);


module.exports = {
    appBuild : resolveApp("build"),
    appPublic: resolveApp("public"),
    appSrc:resolveApp("src"),
    appIndexJs: resolveApp('src/index.js'),
    appHtml: resolveApp('public/index.html'),
    appPackageJson:resolveApp("package.json"),
    appNodeModules:resolveApp("node_modules")
}