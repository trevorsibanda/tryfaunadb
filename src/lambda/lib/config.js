const sha1 = require('sha1')

const config = {
    faunadbServer: {
        secret: "fnADzrmp3pACBuEpd9pOuIaIsNraY-B8EDiF6_T1",
        domain: "db.fauna.com",
        port: "443",
        scheme: "https"
    },
    faunadbAdmin: {

    },
    recaptcha: {
        secret: "6Lds37wZAAAAAM7SBRhH18iRIwSmmYhpwprKXtCx",

    },
    site: {
        updateSnippetHashLife: 60000,
        newSnippetTokenLife: (60000 * 60 * 24 * 7)//unlock token is valid for 7 days
    },
    execution: {
        defaultDocTTL: null,//specify life of execution in faunadb
        invokeTTL: 30000, 
        salt: 'uuit7gvj65eyr765t4waezxcv86ye5d',
        validateChallenge: (id, ts, challenge) => {
            return config.execution.challenge(id, ts) === challenge
        },
        challenge: (id, ts) => {
            return sha1(id + config.execution.salt + ts) 
        }
    },
    pusher: {
        appId: '1053366',
        key: '88b8c8330e7d22fcec60',
        secret: 'd69dba46e43fb5ebde23',
        cluster: 'us2',
        useTLS: true
    }
}

export default config