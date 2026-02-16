const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.ping = functions.https.onRequest((req, res) => {
  res.json({ ok: true, message: "Universal Edu Platform API is live ✅" });
});
