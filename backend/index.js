const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./database')
const cors = require('cors');

const { Parser } = require('@json2csv/plainjs');

const port = 5000

app.use(cors());
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
  response.json({ "/": 'Backend index', "/locations": "Locations of free drinking water" })
})

app.get('/locations', async (request, response) => {
  response.status(200).json(await db.getTable(request.query.q, request.query.f));
})

app.get('/locations/csv', async (request, response) => {
  const rows = await db.getTable(request.query.q, request.query.f)
  try {
    const parser = new Parser();
    const csv = parser.parse(rows);
    response.attachment('locations_filtered.csv');
    response.status(200).send(csv);
  } catch (err) {
    response.status(500)
  }
})

app.get('/locations/json', async (request, response) => {
  const elements = await db.getJson(request.query.q, request.query.f)
  response.attachment('locations_filtered.json');
  response.status(200).json(elements);
})

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}.`)
})