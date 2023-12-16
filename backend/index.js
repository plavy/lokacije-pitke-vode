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

class ResponseWrapper {
  constructor(status, message, response) {
    this.status = status;
    this.message = message;
    this.response = response;
  }
}

class LocationDTO {
  constructor(data) {
    this.name = data.name;
    this.natural_source = data.natural_source;
    this.geolocation_latitude = data.geolocation_latitude;
    this.geolocation_longitude = data.geolocation_longitude;
    this.geolocation_altitude = data.geolocation_altitude;
    this.year_of_opening = data.year_of_opening;
  }
}

const NotImplementedWrapper = new ResponseWrapper("Not Implemented", "Method not supported by this endpoint.", null);
const NotFoundIdWrapper = new ResponseWrapper("Not Found", "Resource with desired ID not found", null);
const InternalErrorWrapper = new ResponseWrapper("Internal Server Error", "Error on server side", null);

app.route('/')
  // TODO: Return API reference
  .get((request, response) => {
    response.json({ "/": 'Backend index', "/locations": "Locations of free drinking water" })
  }).
  all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/locations/table')
  // Get filtered locations as table
  .get(async (request, response) => {
    const rows = await db.getLocationsTable(request.query.q, request.query.f)
    const responseWrap = new ResponseWrapper("OK", "Fetched table of locations.", rows);
    response.status(200).json(responseWrap);
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/locations/csv')
  // Get CSV file with filtered locations
  .get(async (request, response) => {
    const rows = await db.getLocationsTable(request.query.q, request.query.f)
    try {
      const parser = new Parser();
      const csv = parser.parse(rows);
      response.attachment('locations_filtered.csv');
      response.status(200).send(csv);
    } catch (err) {
      response.status(500)
    }
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/locations/json')
  // Get JSON file with filtered locations
  .get(async (request, response) => {
    const elements = await db.getLocations(request.query.q, request.query.f)
    response.attachment('locations_filtered.json');
    response.status(200).json(elements);
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/locations')
  // Get all locations
  .get(async (request, response) => {
    const elements = await db.getLocations();
    if (elements.length > 1) {
      const responseWrap = new ResponseWrapper("OK", "Fetched list of locations.", elements);
      response.status(200).json(responseWrap);
    } else {
      response.status(500).json(InternalErrorWrapper);
    }
  })
  // Create new location
  .post(async (request, response) => {
    const id = await db.createLocation(new LocationDTO(request.body), request.body.maintainer_ids);
    const elements = await db.getLocations(id.toString(), "id", true);
    if (elements.length == 1) {
      response.location(`http://localhost:${port}` + '/locations/' + id);
      response.status(201).json(new ResponseWrapper("Created", "Created new location", elements[0]));
    } else {
      response.status(500).json(InternalErrorWrapper);
    }
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/locations/:id')
  // Get specific location
  .get(async (request, response) => {
    const elements = await db.getLocations(request.params.id, "id", true);
    if (elements.length == 1) {
      const responseWrap = new ResponseWrapper("OK", "Fetched desired location.", elements[0]);
      response.status(200).json(responseWrap);
    } else if (elements.length < 1) {
      response.status(404).json(NotFoundIdWrapper);
    } else {
      response.status(500).json(InternalErrorWrapper);
    }
  })
  // Update specific location
  .put(async (request, response) => {
    const elements = await db.getLocations(request.params.id, "id", true);
    if (elements.length == 1) {
      await db.updateLocation(request.params.id, new LocationDTO(request.body));
      const new_elements = await db.getLocations(request.params.id, "id", true);
      response.status(200).json(new ResponseWrapper("OK", "Location updated.", new_elements[0]))
    } else if (elements.length < 1) {
      response.status(404).json(NotFoundIdWrapper);
    } else {
      response.status(500).json(InternalErrorWrapper);
    }
  })
  // Delete specific location
  .delete(async (request, response) => {
    // Make sure location exists
    const elements = await db.getLocations(request.params.id, "id", true);
    if (elements.length == 1) {
      await db.deleteLocation(request.params.id);
      response.status(200).json(new ResponseWrapper("OK", "Location deleted.", elements[0]));
    } else if (elements.length < 1) {
      response.status(404).json(NotFoundIdWrapper);
    } else {
      response.status(500).json(InternalErrorWrapper);
    }
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/locations/:id/maintainers')
  // Update maintainers for location
  .put(async (request, response) => {
    const elements = await db.getLocations(request.params.id, "id", true);
    if (elements.length == 1) {
      await db.updateLocationMaintainers(request.params.id, request.body.maintainer_ids);
      const new_elements = await db.getLocations(request.params.id, "id", true);
      response.status(200).json(new ResponseWrapper("OK", "Location maintainers updated.", new_elements[0]))
    } else if (elements.length < 1) {
      response.status(404).json(NotFoundIdWrapper);
    } else {
      response.status(500).json(InternalErrorWrapper);
    }
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/maintainers')
  // Get all maintainers
  .get(async (request, response) => {
    const elements = await db.getMaintainers();
    const responseWrap = new ResponseWrapper("OK", "Fetched list of maintainers.", elements);
    response.status(200).json(responseWrap);
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/maintainers/:id')
  // Get specific maintainer
  .get(async (request, response) => {
    const elements = await db.getMaintainers(request.params.id);
    if (elements.length == 1) {
      const responseWrap = new ResponseWrapper("OK", "Fetched desired maintainer.", elements[0]);
      response.status(200).json(responseWrap);
    } else if (elements.length < 1) {
      response.status(404).json(NotFoundIdWrapper);
    } else {
      response.status(500).json(InternalErrorWrapper);
    }
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })


// Other endpoints
app.use((request, response, next) => {
  response.status(404).json(new ResponseWrapper("Not Found", "Endpoint does not exist.", null));
})

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}.`)
})
