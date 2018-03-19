
/* require.config({
    baseUrl: "./src",
    paths: {
        app:"app"
    }
}); */

require( ["./src/app.js", "./src/app1.js", "./src/m/app2.js"],
    function(a, b, c) {
        console.log(a, b, c)
    }
);

// require流程
// 1.运行require, 建立context，加载配置
// 2.运行context.requrie, 创建Module,         
// 3.Module初始化加载依赖，               