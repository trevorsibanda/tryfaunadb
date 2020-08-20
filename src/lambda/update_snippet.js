import f, { query as q} from "faunadb"

import config from "./lib/config"
import code from "./lib/code"

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    let params = JSON.parse(event.body);
    let snippet = params.snippet

    if (!config.execution.validateChallenge(params.pin, params.ts, params.challenge)) {
        return (null, {
            statusCode: 400,
            body: JSON.stringify({
                status: 'hash_mismatch'
            }),
        })
    }

    let now = new Date().getTime() / 1000
    let createTime = parseInt(params.ts)
    if ((now - createTime) > config.site.updateSnippetHashLife) {
        return (null, {
            statusCode: 400,
            body: JSON.stringify({
                status: 'token_expired'
            }),
        })
    }


    let client = new f.Client(config.faunadbServer)
    let inst = await client.query(q.Get(q.Match(q.Index('snippetByLangId'), snippet.env.language, snippet._id))).catch(err => {
        console.log('Failed to get snippet ', params)
    }).finally(_ => undefined)
    if(! inst){
        return ({ statusCode: 404, body: JSON.stringify({error: 'Failed to retrieve snippet.'}) })
    }

    let doc = {
        saved: true,
        env: {}
    }
    if(snippet.code){
        doc.code = code.sanitize(snippet.code)
    }
    if(typeof snippet.title == "string"){
        doc.title = snippet.title.substr(0, 128)
    }
    if (typeof snippet.description == "string") {
        doc.description = snippet.description.substr(0, 512)
    }
        
    //check driver and schema or undefined
    if (snippet.env) {
        doc.env.driver = code.driver(inst.data.lang, snippet.env.driver, undefined)
        doc.env.schema = code.schema(inst.data.lang, snippet.env.driver, undefined)
        doc.env.target = code.target(inst.data.env.target, undefined)
    }
    

    return client.query(q.Update(inst.ref, { data: doc }))
        .then(resp => ({
            statusCode: 200,
            'body': JSON.stringify({ updated: true})
        }
        )).catch(err => ({ statusCode: 402, body: JSON.stringify(err) }))
}
