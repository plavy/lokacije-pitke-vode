const express = require('express')
var router = express.Router();
const db = require('./database')
const { ResponseWrapper, InternalErrorWrapper, NotImplementedWrapper, NotFoundIdWrapper } = require('./index')

// Get all maintainers
router.get('/', async (request, response) => {
    try {
        const elements = await db.getMaintainers();
        const responseWrap = new ResponseWrapper("OK", "Fetched list of maintainers.", elements);
        response.status(200).json(responseWrap);
    } catch (e) {
        console.log(e)
        response.status(500).json(InternalErrorWrapper);
    }
})
router.all('/', (request, response) => {
    response.status(501).json(NotImplementedWrapper);
})

// Get specific maintainer
router.get('/:id', async (request, response) => {
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
router.all('/:id', (request, response) => {
    response.status(501).json(NotImplementedWrapper);
})

module.exports = router;