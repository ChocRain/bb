({
    baseUrl: "client",
    name: "main",
    out: "build/htdocs/js/main.js",

    paths: {
        definitions: "../shared/definitions",

        jquery: "empty:",
        json: "libs/json-0.3.0",
        text: "libs/text-2.0.3",

        _socketio: "empty:",
        _underscore: "libs/underscore-amd-1.4.3-min"
    }
})

