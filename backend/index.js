const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./database')
const cors = require('cors');

const yup = require('yup')
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

let LocationDTO = yup.object({
  name: yup.string().nullable(),
  natural_source: yup.boolean().required(),
  geolocation_latitude: yup.number().required(),
  geolocation_longitude: yup.number().required(),
  geolocation_altitude: yup.number().required(),
  year_of_opening: yup.number().integer().nullable()
})

let MaintainerIDsDTO = yup.array().of(yup.number().integer()).min(1).required()

const NotImplementedWrapper = new ResponseWrapper("Not Implemented", "Method not supported by this endpoint.", null);
const NotFoundIdWrapper = new ResponseWrapper("Not Found", "Resource with desired ID not found", null);
const InternalErrorWrapper = new ResponseWrapper("Internal Server Error", "Error on server side", null);

app.route('/')
  .get((request, response) => {
    response.json({
      "/": 'Backend index', "/locations": "Locations of free drinking water",
      "/maintainers": "Maintainers of locations", "/reference": "Reference for this API"
    })
  }).
  all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('reference')
  // Return API reference
  .get((request, response) => {

  }).all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/locations/table')
  // Get filtered locations as table
  .get(async (request, response) => {
    try {
      const rows = await db.getLocationsTable(request.query.q, request.query.f)
      const responseWrap = new ResponseWrapper("OK", "Fetched table of locations.", rows);
      response.status(200).json(responseWrap);
    } catch (e) {
      console.log(e)
      response.status(500).json(InternalErrorWrapper);
    }
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/locations/csv')
  // Get CSV file with filtered locations
  .get(async (request, response) => {
    try {
      const rows = await db.getLocationsTable(request.query.q, request.query.f)
      const parser = new Parser();
      const csv = parser.parse(rows);
      response.attachment('locations_filtered.csv');
      response.status(200).send(csv);
    } catch (e) {
      console.log(e)
      response.status(500).json(InternalErrorWrapper);
    }
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/locations/json')
  // Get JSON file with filtered locations
  .get(async (request, response) => {
    try {
      const elements = await db.getLocations(request.query.q, request.query.f)
      response.attachment('locations_filtered.json');
      response.status(200).json(elements);
    } catch (e) {
      console.log(e)
      response.status(500).json(InternalErrorWrapper);
    }
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/locations')
  // Get all locations
  .get(async (request, response) => {
    try {
      const elements = await db.getLocations();
      if (elements.length > 1) {
        const responseWrap = new ResponseWrapper("OK", "Fetched list of locations.", elements);
        response.status(200).json(responseWrap);
      } else {
        console.log(e)
        response.status(500).json(InternalErrorWrapper);
      }
    } catch (e) {
      console.log(e)
      response.status(500).json(InternalErrorWrapper);
    }
  })
  // Create new location
  .post(async (request, response) => {
    try {
      const id = await db.createLocation(await LocationDTO.validate(request.body), await MaintainerIDsDTO.validate(request.body.maintainer_ids));
      const elements = await db.getLocations(id.toString(), "id", true);
      if (elements.length == 1) {
        response.location(`http://localhost:${port}` + '/locations/' + id);
        response.status(201).json(new ResponseWrapper("Created", "Created new location", elements[0]));
      } else {
        response.status(500).json(InternalErrorWrapper);
      }
    } catch (e) {
      if (e instanceof yup.ValidationError || e.message.includes("maintainer id=")) {
        response.status(400).json(new ResponseWrapper("Bad Request", e.message, null));
      } else {
        console.log(e)
        response.status(500).json(InternalErrorWrapper);
      }
    }
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/locations/:id')
  // Get specific location
  .get(async (request, response) => {
    try {
      const elements = await db.getLocations(request.params.id, "id", true);
      if (elements.length == 1) {
        const responseWrap = new ResponseWrapper("OK", "Fetched desired location.", elements[0]);
        response.status(200).json(responseWrap);
      } else if (elements.length < 1) {
        response.status(404).json(NotFoundIdWrapper);
      } else {
        response.status(500).json(InternalErrorWrapper);
      }
    } catch (e) {
      console.log(e)
      response.status(500).json(InternalErrorWrapper);
    }
  })
  // Update specific location
  .put(async (request, response) => {
    try {
      // Make sure location exists
      const elements = await db.getLocations(request.params.id, "id", true);
      if (elements.length == 1) {
        await db.updateLocation(request.params.id, await LocationDTO.validate(request.body));
        const new_elements = await db.getLocations(request.params.id, "id", true);
        response.status(200).json(new ResponseWrapper("OK", "Location updated.", new_elements[0]))
      } else if (elements.length < 1) {
        response.status(404).json(NotFoundIdWrapper);
      } else {
        response.status(500).json(InternalErrorWrapper);
      }
    } catch (e) {
      if (e instanceof yup.ValidationError) {
        response.status(400).json(new ResponseWrapper("Bad Request", e.message, null));
      } else {
        console.log(e)
        response.status(500).json(InternalErrorWrapper);
      }
    }
  })
  // Delete specific location
  .delete(async (request, response) => {
    try {
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
    } catch (e) {
      console.log(e)
      response.status(500).json(InternalErrorWrapper);
    }
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/locations/:id/maintainers')
  // Update maintainers for location
  .put(async (request, response) => {
    try {
      // Make sure location exists
      const elements = await db.getLocations(request.params.id, "id", true);
      if (elements.length == 1) {
        await db.updateLocationMaintainers(request.params.id, await MaintainerIDsDTO.validate(request.body.maintainer_ids));
        const new_elements = await db.getLocations(request.params.id, "id", true);
        response.status(200).json(new ResponseWrapper("OK", "Location maintainers updated.", new_elements[0]))
      } else if (elements.length < 1) {
        response.status(404).json(NotFoundIdWrapper);
      } else {
        response.status(500).json(InternalErrorWrapper);
      }
    } catch (e) {
      if (e instanceof yup.ValidationError || e.message.includes("maintainer id=")) {
        response.status(400).json(new ResponseWrapper("Bad Request", e.message, null));
      } else {
        console.log(e)
        response.status(500).json(InternalErrorWrapper);
      }
    }
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/maintainers')
  // Get all maintainers
  .get(async (request, response) => {
    try {
      const elements = await db.getMaintainers();
      const responseWrap = new ResponseWrapper("OK", "Fetched list of maintainers.", elements);
      response.status(200).json(responseWrap);
    } catch (e) {
      console.log(e)
      response.status(500).json(InternalErrorWrapper);
    }
  })
  .all((request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

app.route('/maintainers/:id')
  // Get specific maintainer
  .get(async (request, response) => {
    try {
      const elements = await db.getMaintainers(request.params.id);
      if (elements.length == 1) {
        const responseWrap = new ResponseWrapper("OK", "Fetched desired maintainer.", elements[0]);
        response.status(200).json(responseWrap);
      } else if (elements.length < 1) {
        response.status(404).json(NotFoundIdWrapper);
      } else {
        console.log(e)
        response.status(500).json(InternalErrorWrapper);
      }
    } catch (e) {
      console.log(e)
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
