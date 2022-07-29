var express = require('express');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('firebase-admin');
const xlsx = require('node-xlsx');


const serviceAccount = require('../config/service-account-firebase.json');
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

router.get('/getRandomByCategory', async function (req, res, next) {
  // Create a reference to the cities collection
  const { category } = req.body;
  const quoteRef = db.collection('quotes');
  const queryRef = quoteRef.where('category', '==', category);
  const quotesCategory = await queryRef.get();
  const quotes = []
  quotesCategory.forEach((doc)=>{
    quotes.push(doc.data());
  })
  res.send({
    isSuccess: true,
    quotes: quotes
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
router.post('/addQuotesFromExcel', async function (req, res, next) {
  try {
    var obj = xlsx.parse(__dirname + '/data.xlsx');

    var batch = db.batch();

    for (let i = 1; i < obj[0].data.length - 1; i++) {
      const e = obj[0].data[i];
      console.log(e[1], e[2]);
      let doc = {
        quote: e[1],
        category: e[2]
      }
      var docRef = db.collection("quotes").doc(); //automatically generate unique id
      batch.set(docRef, doc);
    }
    const resFirebase = await batch.commit();
    if (resFirebase) {
      res.send({ isSuccess: true })
    }
  } catch (error) {
    console.log(error);
    res.send({ isSuccess: false, error })
  }
});

module.exports = router;
