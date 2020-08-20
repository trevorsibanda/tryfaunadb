

const config =  {
    supportedEnvs: {
        "js": {
            "name": "NodeJS",
            "value": "javascript",
            "drivers": [{
                "value": "v3.0.1",
                "name": "v3.0.1 (August 2020)",
            },
                {
                    "value": "v2.14.0",
                    "name": "v2.14.0 (June 2020)"
                },
                {
                    "value": "v2.13.0",
                    "name": "v2.13.0 (April 2020)"
                },
                {
                    "value": "v2.12.0",
                    "name": "v2.12.0 (March 2020)"
                },
                {
                    "value": "v2.11.0",
                    "name": "v2.11.0 (November 2019)"
                },
                {
                    "value": "v2.10.0",
                    "name": "v2.10.0 (November 2019)"
                }]
        },
        "python": {
            "name": "Python 3",
            "value": "python",
            "drivers": [{
                "value": "v3.0.0",
                "name": "v3.0.0 (August 2020)"
            },
            {
                "value": "v2.12.0",
                "name": "v2.12.0 (March 2020)"
            },
            {
                "value": "v2.10.0",
                "name": "v2.10.0 (November 2019)"
            }]
        },
        "go": {
            "name": "Golang",
            "value": "go",
            "drivers": [{
                "value": "v3.0.0",
                "name": "v3.0.0 (August 2020)",
            },
            {
                "value": "v2.12.1",
                "name": "v2.12.1 (March 2020)"
            },
            {
                    "value": "v2.11.0",
                    "name": "v2.11.0 (November 2019)"
            },
            {
                "value": "v2.10.0",
                "name": "v2.10.0 (November 2019)"
            }]
        }
    },
    schemas: [
        {name: "Empty Database", key: "emptydb", link: "http://"},
        {name: "World DB", key: "world", link: "http://"},
        {name: "People", key: "people", link: ""}
    ],
    api: {
        endpoint: (path) => {
            return config.site.url('.netlify/functions/'+path)
        },
        faunaOpts: {
            secret: "fnADzrnYmGACBvjyn7S6Pf6AhBreAGPerA3IMogD",
            domain: "db.fauna.com",
            port: "443",
            scheme: "https"
        },
        pusherOpts: {
            clientKey: '88b8c8330e7d22fcec60',
            clientOpts: {
                cluster: 'us2'
            }
        }
    },
    site: {
        url: (path) => {
            return 'https://tryfaunadb.dev/'+path
        },
        snippetUrl: (lang, id) => {
            return config.site.url('_/'+ lang+'/'+id)
        },
        schemaUrl: (schema) => {
            return `https://github.com/trevorsibanda/tryfaunadbdata/master/${schema}`
        },
        recaptchaSiteKey: '6Lds37wZAAAAAO7BWARmtjKjTVkM7_x0-sUMVLQ0',
        queueTimeout: 30000, //how long to cancel queued non-started execution
        maxExecutionTime: 120000,//2 mins max

    }
}

export default config;