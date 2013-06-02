({
    baseUrl: "../client",
    name: "main",
    out: "../build/htdocs/js/main.js",

    paths: {
        shared: "../shared",

        jquery: "empty:",
        json: "../shared/libs/json-0.3.1",
        text: "../shared/libs/text-2.0.6",

        _socketio: "empty:",
        _underscore: "libs/underscore-amd-1.4.4-min"
    }
})

