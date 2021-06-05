const admin = require('firebase-admin')
const serviceAccount = require('../config/firebase-service-account.json')

var firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
        'https://outline-13077-default-rtdb.europe-west1.firebasedatabase.app/',
})

const FCMHelper = {
    sendPushNotification: (message) => {
        admin
            .messaging()
            .send(message)
            .then((response) => {
                console.log('Successfully sent message:', response)
            })
            .catch((error) => {
                console.log('Error sending message:', error)
            })
    },
}

module.exports = FCMHelper
