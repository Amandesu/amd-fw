
require.config({
    baseUrl: "/src",
    paths: {
        app:"app.js"
    }
});

require( ["app", "./app1.js"],
    function(someModule,    myModule) {
        console.log(someModule, myModule)
    }
);

