import config from "./lib/config"

var Pusher = require('pusher');


export async function handler(event, context, callback) {
    let params = JSON.parse(event.body);

    if( ! config.execution.validateChallenge(params.id, params.ts, params.challenge)){
        return callback(null, {
            statusCode: 400,
            body: JSON.stringify({
                status: 'hash_mismatch'
            }),
        })
    }

    let now = new Date().getTime()/1000
    let createTime =   parseInt(params.ts)
    if((now - createTime) > config.execution.invokeTTL){
        return callback(null, {
            statusCode: 400,
            body: JSON.stringify({
                status: 'invoke_expired'
            }),
        })
    }

    //
    var pusher = new Pusher({
        appId: '1053366',
        key: '88b8c8330e7d22fcec60',
        secret: 'd69dba46e43fb5ebde23',
        cluster: 'us2',
        useTLS: true
    });

    //TODO: make this an http request
    pusher.trigger('new_activations', 'add', {
        'channel': params.id,
        _id: params.id,
    })

    callback(null, {
        statusCode: 200,
        body: JSON.stringify({
             status: 'ok' 
        }),
    })
}