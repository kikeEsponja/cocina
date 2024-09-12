const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { parseStringPromise } = require('xml2js');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();
//--------------------------- APP USE -------------------------------------------------------------
app.use(cors());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());

//-------------------------------------------------------------------------------------------------

//------------------------- ENDPOINT PRINCIPAL ----------------------------------------------------

app.get('/api/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find().limit(100);
        res.json(recipes);
    } catch (error) {
        console.error('Error al obtener libros:', error);
        res.status(500).send('Error al obtener libros');
    }
});
//-------------------------------------------------------------------------------------------------

const { Schema } = mongoose;
const ObjectId = Schema.Types.ObjectId;

const recipeSchema = new Schema({
  _id: ObjectId,
  recipe: {
    uri: String,
    label: String,
    image: String,
    source: String,
    url: String,
    shareAs: String,
    yield: Number,
    dietLabels: [String],
    healthLabels: [String],
    cautions: [String],
    ingredientLines: [String],
    ingredients: [
      {
        text: String,
        quantity: Number,
        measure: String,
        food: String,
        weight: Number,
        foodCategory: String,
        foodId: String,
        image: String
      }
    ]
  }
});

const Recipe = mongoose.model('Recipe', recipeSchema);
//-------------------------------------------------------------------------------------------------

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
  });

/*const privateKey = fs.readFileSync('../src/certificado/postfix.pem', 'utf-8');
const certificate = fs.readFileSync('../src/certificado/proftpd.pem', 'utf-8');
const credentials = {key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);*/

let privateKey, certificate;

try {
  privateKey = fs.readFileSync('./src/certificado/privkey1.pem', 'utf-8');
} catch (error) {
  console.error("Error reading private key:", error.message);
  process.exit(1);
}

try {
  certificate = fs.readFileSync('./src/certificado/cert1.pem', 'utf-8');
} catch (error) {
  console.error("Error reading certificate:", error.message);
  process.exit(1);
}

const credentials = { key: privateKey, cert: certificate };

let httpsServer;

try {
  httpsServer = https.createServer(credentials, app);
} catch (error) {
  console.error("Error creating HTTPS server:", error.message);
  process.exit(1);
}

const PORT = process.env.PORT || 1034;
httpsServer.listen(PORT, () => {
//app.listen(PORT, () =>{
  console.log(`Server running on port ${PORT}`);
});