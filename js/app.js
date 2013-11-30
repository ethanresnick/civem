requirejs.config({
    //Load module IDs from js/lib by default, 
    //but, if the module ID starts with "app",
    //then load it from the js/app directory.
    baseUrl: 'js/lib',
    paths: { 
    	app: '../app',
    	jquery: 'http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min',
        J50Npi: 'J50Npi.min'
    },
    shim: {
        'J50Npi': {
            exports: 'J50Npi'
        },
        'app/helpers/mustache': ['can']
    }
});

require(["jquery", "app/can", "app/Controller"], function($, can, Controller) {
    $(function() { new Controller("#app"); });
});