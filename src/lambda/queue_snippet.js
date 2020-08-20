import fetch from "node-fetch"
import f, { query as q } from "faunadb"
import config from "./lib/config"
import code from "./lib/code"

const sha1 = require('sha1')


export async function handler(event, context, callback) {
    let params = JSON.parse(event.body);

    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + config.recaptcha.secret + '&response=' + params.recaptchaToken;

    let verify = await fetch(verificationUrl).then(res => res.json())
    console.log(verify)
    if (!verify.success || verify.score <= 0.5) {
        //likely a bot, do not create
        return ({ statusCode: 400, body: JSON.stringify({ error: 'Your recaptcha score was ' + verify.score + ' which is too low to create new snippets' }) })
    }

    let client = new f.Client(config.faunadbServer)
    let inst = await client.query(q.Get(q.Match(q.Index('snippetByLangId'), params.snippet.env.language, params.snippet._id))).catch(err => {
        console.log('Failed to get snippet ', params)
    }).finally(_ => undefined)

    if (!inst) {
        return ({ statusCode: 404, body: JSON.stringify({ error: 'Failed to retrieve snippet.' }) })
    }

    let token = params.unlockToken
    let unlocked = false
    if(token){
        if (!config.execution.validateChallenge(token.pin, token.ts, token.challenge)) {
            return (null, {
                statusCode: 400,
                body: JSON.stringify({
                    status: 'hash_mismatch'
                }),
            })
        }

        let now = new Date().getTime() / 1000
        let createTime = parseInt(token.ts)
        if ((now - createTime) > config.site.newSnippetTokenLife) {
            return (null, {
                statusCode: 400,
                body: JSON.stringify({
                    status: 'token_expired'
                }),
            })
        }
        unlocked = true
    }

    let doc = inst.data

    let execution = {
        _id: sha1(Math.random() + params.code + Date.now().toString()),
        snippet_id: doc._id,
        code: code.sanitize(params.snippet.code),
        lang: doc.env.language,
        driver: code.driver(doc.env.language, params.snippet.env.driver, 'latest'),
        schema: code.schema(doc.env.language, params.snippet.env.schema, 'emptydb'), 
        saved: true,
        target: 'local', //allow specifying a different target
        activation: {
            _id: null,
            platform: 'openwhisk',
            kind: '', //kind/image used to execute snippet
            results: [],
            logs: [],
            queries: [],
            faunaInstance: {
                domain: '',
                secret: '',
                database: '',
                logs: [],
            },
            raw: null //stores raw activation results
        }
    }

    let updateDocQuery = q.Now()
    if(unlocked){
        let ndoc = {
            saved: true,
            env: {}
        }
        let snippet = params.snippet
        if (snippet.code) {
            ndoc.code = code.sanitize(snippet.code)
        }
        if (typeof snippet.title === "string") {
            ndoc.title = snippet.title.substr(0, 128)
        }
        if (typeof snippet.description === "string") {
            ndoc.description = snippet.description.substr(0, 512)
        }

        //check driver and schema or undefined
        if (snippet.env) {
            ndoc.env.driver = code.driver(doc.lang, snippet.env.driver, undefined)
            ndoc.env.schema = code.schema(doc.lang, snippet.env.driver, undefined)
            ndoc.env.target = code.target(doc.env.target, undefined)
        }
        updateDocQuery = q.Update(inst.ref, { data: ndoc })
    }

    return client.query([q.Create(
        q.Collection('execution'),{
            data: execution,
            ttl: config.execution.defaultDocTTL
        }), updateDocQuery]).then(res => {
        console.log(res)
        let id = execution._id
        const ts = Math.floor(Date.now() / 1000);
        let challenge = config.execution.challenge(execution._id, ts)
        let status = 'ok'
        return {
            statusCode: 200,
            body: JSON.stringify({id, challenge, ts, status}),
        }
    })

     
}
