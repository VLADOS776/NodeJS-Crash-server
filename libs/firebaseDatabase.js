var firebase = require('firebase-admin');
var config = require('./config');

var serviceAccount = require('./fbKey.json');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://admob-app-id-8282025074.firebaseio.com/"
});

module.exports = firebase;