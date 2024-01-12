const express = require('express')
var router = express.Router();
const db = require('./database')
const { ResponseWrapper, InternalErrorWrapper, NotImplementedWrapper, NotFoundIdWrapper, addContextToLocation, addContextToLocations } = require('./index')

// Get filtered locations as table
router.get('/table', async (request, response) => {
    try {
        const rows = await db.getLocationsTable(request.query.q, request.query.f)
        const responseWrap = new ResponseWrapper("OK", "Fetched table of locations.", rows);
        response.status(200).json(responseWrap);
    } catch (e) {
        console.log(e)
        response.status(500).json(InternalErrorWrapper);
    }
})
router.all('/table', (request, response) => {
    response.status(501).json(NotImplementedWrapper);
})

// Get CSV file with filtered locations
router.get('/csv', async (request, response) => {
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
router.all('/csv', (request, response) => {
    response.status(501).json(NotImplementedWrapper);
})

// Get JSON file with filtered locations
router.get('/json', async (request, response) => {
    try {
        const elements = await db.getLocations(request.query.q, request.query.f)
        response.attachment('locations_filtered.json');
        response.status(200).json(elements);
    } catch (e) {
        console.log(e)
        response.status(500).json(InternalErrorWrapper);
    }
})
router.all('/json', (request, response) => {
    response.status(501).json(NotImplementedWrapper);
})

// Get all locations
router.get('/', async (request, response) => {
    try {
        const elements = await db.getLocations();
        if (elements.length > 1) {
            const responseWrap = new ResponseWrapper("OK", "Fetched list of locations.", addContextToLocations(elements));
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
router.post('/', async (request, response) => {
    try {
        const id = await db.createLocation(await LocationDTO.validate(request.body), await MaintainerIDsDTO.validate(request.body.maintainer_ids));
        const elements = await db.getLocations(id.toString(), "id", true);
        if (elements.length == 1) {
            response.location(`http://localhost:${port}` + '/locations/' + id);
            response.status(201).json(new ResponseWrapper("Created", "Created new location", addContextToLocation(elements[0])));
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
router.all('/', (request, response) => {
    response.status(501).json(NotImplementedWrapper);
})

// Get specific location
router.get('/:id', async (request, response) => {
    try {
        const elements = await db.getLocations(request.params.id, "id", true);
        if (elements.length == 1) {
            const responseWrap = new ResponseWrapper("OK", "Fetched desired location.", addContextToLocation(elements[0]));
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
router.put('/:id', async (request, response) => {
    try {
        // Make sure location exists
        const elements = await db.getLocations(request.params.id, "id", true);
        if (elements.length == 1) {
            await db.updateLocation(request.params.id, await LocationDTO.validate(request.body));
            const new_elements = await db.getLocations(request.params.id, "id", true);
            response.status(200).json(new ResponseWrapper("OK", "Location updated.", addContextToLocation(new_elements[0])))
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
router.delete('/:id', async (request, response) => {
    try {
        // Make sure location exists
        const elements = await db.getLocations(request.params.id, "id", true);
        if (elements.length == 1) {
            await db.deleteLocation(request.params.id);
            response.status(200).json(new ResponseWrapper("OK", "Location deleted.", addContextToLocation(elements[0])));
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
router.all('/:id', (request, response) => {
    response.status(501).json(NotImplementedWrapper);
})

// Update maintainers for location
router.put('/:id/maintainers', async (request, response) => {
    try {
        // Make sure location exists
        const elements = await db.getLocations(request.params.id, "id", true);
        if (elements.length == 1) {
            await db.updateLocationMaintainers(request.params.id, await MaintainerIDsDTO.validate(request.body.maintainer_ids));
            const new_elements = await db.getLocations(request.params.id, "id", true);
            response.status(200).json(new ResponseWrapper("OK", "Location maintainers updated.", addContextToLocation(new_elements[0])))
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
router.all('/:id/maintainers', (request, response) => {
    response.status(501).json(NotImplementedWrapper);
})

module.exports = router;