const express = require('express')
var router = express.Router();
const path = require('path');
const fs = require('fs')
const yup = require('yup');

class ResponseWrapper {
    constructor(status, message, response) {
        this.status = status;
        this.message = message;
        this.response = response;
    }
}

const NotImplementedWrapper = new ResponseWrapper("Not Implemented", "Method not supported by this endpoint.", null);
const NotFoundIdWrapper = new ResponseWrapper("Not Found", "Resource with desired ID not found", null);
const InternalErrorWrapper = new ResponseWrapper("Internal Server Error", "Error on server side", null);

let LocationDTO = yup.object({
    name: yup.string().nullable(),
    natural_source: yup.boolean().required(),
    geolocation_latitude: yup.number().required(),
    geolocation_longitude: yup.number().required(),
    geolocation_altitude: yup.number().required(),
    year_of_opening: yup.number().integer().nullable()
})

let MaintainerIDsDTO = yup.array().of(yup.number().integer()).min(1).required()

// Return API reference
router.get('/', (request, response) => {
    const fileName = 'openapi.json';
    const filePath = path.join(__dirname, '../..', fileName);
    if (fs.existsSync(filePath)) {
      response.status(200).sendFile(filePath);
    } else {
      response.status(500).json(InternalErrorWrapper);
    }
  })
router.all('/', (request, response) => {
    response.status(501).json(NotImplementedWrapper);
  })

module.exports = {
    router,
    ResponseWrapper,
    InternalErrorWrapper,
    NotFoundIdWrapper,
    NotImplementedWrapper,
    LocationDTO,
    MaintainerIDsDTO
}