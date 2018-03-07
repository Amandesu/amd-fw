
require.config({
    baseUrl: "./src",
    paths: {
        app:"app"
    }
});

require( ["app", "./src/app1.js"],
    function(someModule,    myModule) {
    }
);

