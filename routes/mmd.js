var express = require('express');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('firebase-admin');

const serviceAccount = require('../config/mmd_service_account_firebase.json');
fs.initializeApp({
  credential: fs.credential.cert(serviceAccount)
});
const db = getFirestore();
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('welcome to make my day api');
});

router.get('/getQuotes', async function (req, res, next) {
  const snapshot = await db.collection('quotes').get();
  console.log(snapshot.size);;
  const quotes = []
  snapshot.forEach((doc) => {
    console.log(doc.id, '=>', doc.data());
    quotes.push(doc.data());
  });

  res.send({
    isSuccess: true,
    quotes
  })
});

router.get('/getRandomQuote', async function (req, res, next) {
  const snapshot = await db.collection('quotes').get();
  const numberOfUsers = snapshot.size;
  const randomIndex = Math.floor(Math.random() * numberOfUsers);
  const quotes = []
  snapshot.forEach((doc) => {
    console.log(doc.id, '=>', doc.data());
    quotes.push(doc.data());
  });

  res.send({
    isSuccess: true,
    quote: quotes[randomIndex]
  })
});

router.post('/addQuotes', async function (req, res, next) {
  try {
    const quotes = req.body;
    var batch = db.batch();

    quotes.forEach((doc) => {
      var docRef = db.collection("quotes").doc(); //automatically generate unique id
      batch.set(docRef, doc);
    });

    const resFirebase = await batch.commit()

    console.log(resFirebase, "resFirebase");

    if (resFirebase) {
      res.send({ isSuccess: true })
    }
  } catch (error) {
    res.send({ isSuccess: false })
  }
});

module.exports = router;
