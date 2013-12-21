require.config({
    # Load module IDs from js/lib by default, 
    # but, if the module ID starts with "app",
    # then load it from the js/app directory.
    baseUrl: 'js/lib',
    enforceDefine: true,
    paths: { 
    	app: '../app',
    	jquery: [
            'http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min',
            'jquery'
        ]
    }
})

define(["jquery", "app/can", "app/views", "app/Controller"], ($, can, views, Controller) -> 
    $(-> new Controller("#app"))
)