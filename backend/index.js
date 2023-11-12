const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./database')
const cors = require('cors');

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

app.get('/locations', db.getLocations)

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}.`)
})