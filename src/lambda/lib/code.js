
const schemas = [
    "emptydb", //not provisioned
    "world", //countrydb
    "people", //peopledb
]

const targets = [
    "local"
]

const drivers = {
    "js": [
        "latest", "v3.0.1", "v2.14.0", "v2.13.0", "v2.12.0", "v2.11.0", "v2.10.0"
    ],
    "python": [
        "latest", "v3.0.0", "v2.12.0", "v2.10.0"
    ],
    "go": [
        "latest", "v3.0.0", "v2.12.1", "v2.11.0", "v2.10.0"
    ]
}

const codeTemplates = {
    "js": {
        "default": `
//system:
// mem: 128mb, network: no, max-runtime: 30s, disc: no
// db_persistance: no
//
//imports:
//const faunadb = require('faunadb')
//const q = faunadb.query

async function handler(client) {
    let queries = [
        q.Paginate(q.Collections()),
        q.Paginate(q.Indexes()),
        q.Paginate(q.Functions()),
        q.Paginate(q.Roles()),
    ]
    return client.query(q.Now()).then(time => {
        console.log('The time is ', time)
        return client.query(queries).then(console.log)
    })
}`
    },
    "python": {
        "default": `
#system:
# mem: 128mb, network: no, max-runtime: 30s, disc: no
# db_persistance: no
#
#imports:
# import traceback
# import logging
# import faunadb
# from faunadb import query as q
# from faunadb.client import FaunaClient

import os

def handler(client):
    now = client.query(q.now())
    print('the time is', now)
    queries = [
        q.paginate(q.collections()),
        q.paginate(q.indexes()),
        q.paginate(q.functions()),
        q.paginate(q.roles()),
    ]
    print(client.query(queries))
`
    }, 
    "go": {
        "default": `
//system: 128mb, networking: no, max-runtime: 60s, disc: no
//db_persistence: no
//
//imports:
// import (
//    "os"
//    "fmt"
//    f "github.com/fauna/faunadb-go/faunadb" <- below v2
//    f "github.com/fauna/faunadb-go/v3/faunadb" <- v3
//)
//
//
import (
	"time"
)

func handler(client *f.FaunaClient) {
	var t time.Time
	res, err := client.Query(f.Now())
	if err != nil {
		panic(err)
	}
	res.Get(&t)
	fmt.Println("It is currently, ", t)

	return
}
`
    }
}

function targetOrDefault(lang, target, _default) {
    return targets.includes(target) ? target : _default
}

function driverOrDefault(lang, driver, _default) {
    if(drivers[lang]){
        return drivers[lang].includes(driver) ? driver : _default
    } else {
        return _default
    }
}

function supportedLang(lang) {
    return drivers[lang] !== undefined
}

function schemaOrDefault(lang, schema, _default){
    return schemas.includes(schema) ? schema : _default
}

function sanitizeCode(str) {
    let code = str.substr(0, 1024 * 1024) //1mb code max
    return code
}

function starterCode(lang, driver) {
    var code
    let langt = codeTemplates[lang]
    code = codeTemplates[lang]["default"]
    if(langt[driver]) {
        return langt[driver]
    }
    return code
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
    driver: driverOrDefault,
    schema: schemaOrDefault,
    target: targetOrDefault,
    defaultCode: starterCode,
    supportedLang: supportedLang,
    sanitize: sanitizeCode,
    id: makePin
}