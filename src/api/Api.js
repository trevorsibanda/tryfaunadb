import f from "faunadb"
import config from "../config"

import Pusher from "pusher-js"

const faunaClient = new f.Client(config.api.faunaOpts)
const pusher = new Pusher(config.api.pusherOpts.clientKey,
    config.api.pusherOpts.clientOpts);

function checkService(cbSuccess, cbErr) {
    faunaClient.query(f.query.NewId())
                .then(resp => cbSuccess('faunadb', resp.data == null))
                .catch(err => cbErr('faunadb', err))
    
    fetch(config.api.endpoint('whiskey_status'))
        .then(resp => resp.json())
        .then(json => cbSuccess('whiskey', json.ready))
        .catch(err => cbErr('whiskey', err))
    
    fetch(config.api.endpoint('api_status'))
        .then(resp => resp.json())
        .then(json => cbSuccess('api', json.live))
        .catch(err => cbErr('api', err))
}

function newSnippet(recaptchaToken, lang, driverVer, schema, pin) {
    let payload = {
        recaptchaToken: recaptchaToken,
        lang: lang,
        driver: driverVer,
        schema: schema,
        pin: pin
    }
    
    return fetch(config.api.endpoint('new_snippet'), {method: "post", body: JSON.stringify(payload)})
            .then(resp => resp.json().then(json => {
                    if (json.created) {
                        console.log('adding to localstorage')
                        localStorage.setItem(json._id, JSON.stringify(json.token))
                    }
                    return json
                })
            )
}

function readSnippet(lang, id) {
    let q = f.query
    return faunaClient.query(q.Call('readSnippet', id, lang))
}

function updateSnippet(unlockPin, ts, challenge, snippet) {
    let payload = {
        pin: unlockPin,
        ts: ts,
        challenge: challenge,
        snippet: snippet
    }
    return fetch(config.api.endpoint('update_snippet'), { method: "post", body: JSON.stringify(payload) })
        .then(resp => resp.json())
}

function queueSnippet(recaptchaToken, snippet) {
    let unlockToken = localStorage.getItem(snippet._id)
    if(unlockToken){
        unlockToken = JSON.parse(unlockToken)
    }
    let payload = {
        unlockToken,
        recaptchaToken: recaptchaToken,
        snippet: snippet
    }
    return fetch(config.api.endpoint('queue_snippet'), { method: "post", body: JSON.stringify(payload) })
        .then(resp => resp.json())
}

function unlockSnippet(snippet, pin) {
    if(pin == null) {
        return new Promise( (resolve, reject) => {
            let token = JSON.parse(localStorage.getItem(snippet._id))
            if(token.challenge) {
                resolve(token)
            }else {
                reject('Unlock token not in localStorage')
            }
        })
    }
    let payload = {snippet, pin}
    return fetch(config.api.endpoint('snippet_token'), { method: "post", body: JSON.stringify(payload) })
        .then(resp => resp.json())
}


function connectWhiskey(activationId, onConnect, handler) {
    
    var channel = pusher.subscribe(activationId);
    channel.bind('teardown', function (data) {
        handler('teardown', data)
        setTimeout(_ => channel.disconnect(), 60000)
    });
    channel.bind('result', data => handler('result', data))
    channel.bind('status', data => handler('status', data))
    channel.bind('fatal',  data => {
        setTimeout(_ => channel.disconnect(), 60000)
        handler('fatal', data)
    })
    onConnect();
}

function whiskeyStartExecution(id, challenge, ts){
    let payload = {id, challenge, ts}
    return fetch(config.api.endpoint('start_execution'), { method: "post", body: JSON.stringify(payload) })
        .then(resp => resp.json())
}

async function whiskeyCancelInvoke(){
    return false
}

function whiskeyStatusMsg(key) {
    let lookup = {
        'faunadbinit': 'Faunadb instance initializing...',
        'faunadbschema': 'Loading data into database...',
        'faunadbready': 'Faunadb instance is ready...',
        'execstarted': 'Running please wait...',
        'teardown': 'Freeing up resources, tearing down database',
    }
    return lookup[key] ? lookup[key] : JSON.stringify(key)
}

function loadRandomSnippet(lang) {
    let payload = {lang: lang}
    return fetch(config.api.endpoint('random_snippet'), { method: "post", body: JSON.stringify(payload) })
        .then(resp => resp.json())
}

function makePin(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


export default {
    snippet: {
        create: newSnippet,
        read:   readSnippet,
        update: updateSnippet,
        unlock: unlockSnippet,
        delete: null,
    },
    social:  {
        trending: null,
        templates: null,
        randomSnippet: loadRandomSnippet,
    },
    whiskey: {
        queue: queueSnippet,
        invoke: whiskeyStartExecution,
        cancel: whiskeyCancelInvoke,
        connect: connectWhiskey,
        statusMsg: whiskeyStatusMsg,
    },
    service: {
        health: checkService,
    },
    util: {
        makePin: makePin
    }
}