export function handler(event, context, callback) {
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({_id: 'startHere', lang: 'js'}),
    })
}
