
import f, { query as q } from "faunadb"

import config from "./lib/config"


exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }
    
    let params = JSON.parse(event.body)
    let snippet = params.snippet

    let client = new f.Client(config.faunadbServer)
    return client.query(q.Get(q.Match(q.Index('snippetByLangId'), snippet.env.language, snippet._id))).then(doc => {
        let ts = new Date().getTime() / 1000
        let challenge = config.execution.challenge(params.pin, ts)

        
        var response

        if(doc.data.pin === params.pin){
            response = {
                status: "ok", token: {
                    "ts": ts,
                        "pin": doc.data.pin,
                            "challenge": challenge
                }
            }
        } else {
            response = {
                status: "failed",
                message: "Incorrect pin."
            }
        }

        return (null, {
            statusCode: 200,
            body: JSON.stringify(response),
        })
    }).catch(err => {
        console.log(err)
        return (null, {
            statusCode: 404,
            body: JSON.stringify({
                status: "failed",
                message: "Snippet not found."
            }),
        })
    })
    
}
