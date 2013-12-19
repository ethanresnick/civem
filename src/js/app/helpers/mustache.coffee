define(["can"], (can) ->
    can.Mustache.registerHelper('titleCase', (str, options) ->
        (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, ($1) -> $1.toUpperCase())
    )
)