can.Mustache.registerHelper('titleCase', function(str, options) {
    return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
   	    return $1.toUpperCase();
    });
});