var firebase = require('firebase');
var config = require('./config');

firebase.initializeApp({
    serviceAccount: {
        projectId: "admob-app-id-8282025074",
        clientEmail: "nodeserver@admob-app-id-8282025074.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCs5xGeHfY6AzK6\ng8HO/gwRPcWKSndPAjV5+oSVuqZYzzp2S4cqZURN8PjDpOgijMC3bMRKwgtEik6F\nvXp2RqxwO9c8nv3P5Nj9G4D9dq1/IhKaD2u5kMR3G3o0xY8z8H/1q+XtAiM51q+n\nx54ySbY8S+UdI4hf6dTE+FTp2d8yIWjLsDR44Uq22ux6TfcuNNbzLd4F4xycK0AJ\nQtfK5udntwg0C/+Xlij6D8gLatrYZtSzgzIx97wKNwjchnwHAEm7CKpw5bVdVIB5\ntB1Ak4pJXqA3BJv11Iz+9UwBrBRXDp2J3zrhuFt3w9gYMyUxcnY3SJtFbOKqxrp6\n7uZfFZfvAgMBAAECggEASbx9Ye4rLNBiWPKJu6nSIaQzU2ewe+xYO/3ffy9Lc8Jk\nj0Bkk2r+dzLWFDGGof1ezpq/F5arUX6eQCDvUfOP5IlQoFS5r2hMNZz+JJnxIa+5\nOSRsb4XSk20Pb+P0z1S4bV/yvWHU/fyVirrxt0aCRjKjsgqORUEmcR3qsJQuwGSV\nnCEbFXwpNks9NVFRpVpADEjHBA5zmg242Ek6Ry3mPotlpt0U4EzoI5MBn5ChR7J9\nwwZYlLqy7IKjfNgZgbGsFoZz1u6Q+rOH3WxSBBPTiXxIfv0IY5fIsJLe6jZOXF9S\n2euV7psaa/j1WjR+0bXdS03bjhqDhNFcQIJO5YcI2QKBgQDXBdJsk02sTx8cM4UQ\nurC09BcIAqVhVSZcHCCCxYPFCYsR3L69STpyk8Pofj/oeVgoUhuRMTFZS1FqkflN\nNEdtqypT925mbCocgAIKHE0od6HAdH2y+3JqFFoqMUarHbzewQtg1D46qdPTtbB7\nVHrObDCnwXIcyQ1+X4E93OmWbQKBgQDN2lvcJvuQYw7i0cj9/C/FDxCmilAGuqVr\n30QSGQO3JsApbjiuDjBBb+A82GSLGolxkk59Vcg2Lr+DwGk81tCVtwQZZ4Ae436w\nk7iCiVC1XFBqhkCbbXsFMMD3Nlb9GTV3u1AvSiGXfjpOo8Otf2MkghKDAl8XeyWg\nzu6Q3oTeSwKBgQCv+sbWL9TBMlxO02eTYoffAWqcFrZNq8fiWO7OuGJ476+PJfBB\nsN4SCherfzBEzpM1JMYFFZLC9x6iLugvpJrVCeJxqC8Fyn7IpoeEyNbpSMfsYCrE\nQoDIivGkWIHy6Dq8wJfUXsCzeGyyd6ABwAlmSiukEHGZV38gr39yJwxSHQKBgHRO\nP0BvtgqqLSryJIF8DvFjxaCS3QwwQG5mQuuGvpaoikHeSJ/u3EzcjPFTwdrmL2m/\npCEkam5Sk1o5SDxbkpZERUilNbo+BsJ1c/Ys5zDQ646EM9SdUrhoB16lkRiHObJg\nXrmZRMl3RDJSTKimJLnn09W5bUizB1uIDzpCvwdpAoGBAIx75WK/ei6J36KVCVtV\ng1PSP6PifwfEzys6AZa+rUIdfSv3f/Ug1qzsUvaDdItnEA3b7DDKr/Rri9dJahOR\n/+Mx7yYx2/sW3j/BgaJwXnwBPsh51zGnW6PK/1RBD3J8ZGyZl7K06fgRScBGF21R\nWkKH8U5scSaza75C67/fwbl+\n-----END PRIVATE KEY-----\n"
    },
    databaseURL: "https://admob-app-id-8282025074.firebaseio.com/"
});

module.exports = firebase;