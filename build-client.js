({
    baseUrl: "client",
    name: "main",
    out: "build/htdocs/js/main.js",

    paths: {
        definitions: "../shared/definitions",

        jquery: "empty:",
        json: "../shared/libs/json-0.3.0",
        text: "../shared/libs/text-2.0.3",

        _socketio: "empty:",
        _underscore: "libs/underscore-amd-1.4.3-min"
    }
})

