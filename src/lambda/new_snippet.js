import fetch from "node-fetch"
import f, {query} from "faunadb"

import config from "./lib/config"
import code from "./lib/code"

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    let params = JSON.parse(event.body);

    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + config.recaptcha.secret + '&response=' + params.recaptchaToken ;
    
    if (!code.supportedLang(params.lang)) {
        return { statusCode: 400, body: JSON.stringify({"error": "Unsupported language."}) };
    }

    let doc = {
        _id: code.id(6),
        code: code.defaultCode(params.lang, 'latest'),
        title: '',
        description: `${params.lang} code snippet description created ${Date().toString()}`,
        saved: false, //has the snippet been saved 
        pin: params.pin ? params.pin: code.id(8),
        perms: {
            readOnly: false,
            executable: true,
        },
        ts: query.Now(),
        env: {
            language: params.lang,
            driver: code.driver(params.driver, 'latest'),
            schema: code.schema(params.schema, 'emptydb'),
            target: code.target(params.lang, 'local', 'local'),
        },
        stats: {
            executionsSuccessful: 0,
            executionsFailed: 0,
            lastExecutionStatus: 'not_executed',
            lastExecutionTime: 0,
        }
    }
    let client = new f.Client(config.faunadbServer)
    let verify = await fetch(verificationUrl).then(res => res.json())
    if(!verify.success || verify.score <= 0.5){
        //likely a bot, do not create
        console.log(verify, params)
        return ({ statusCode: 400, body: JSON.stringify({error: 'Your recaptcha score was '+ verify.score + ' which is too low to create new snippets' })})
    }

    const ts = Math.floor(Date.now() / 1000);
    let challenge = config.execution.challenge(doc.pin, ts)
    let token = {ts, challenge, pin: params.pin}

    return client.query(query.Create(query.Collection('snippet'), {data: doc}))
            .then(resp => ({ statusCode: 200,
            'body': JSON.stringify({ created: true, token: token, _id: doc._id })
            }
            )).catch(err => ({statusCode: 402, body: JSON.stringify(err)}))
}
 