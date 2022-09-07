'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('../swagger.json')
const rideService = require('./ride')

module.exports = (db) => {

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))

    app.get('/health', (req, res) => {
        // #swagger.tags = ['health']
        // #swagger.description = 'To get current service health status'

        res.send('Healthy')
    });

    app.post('/rides', jsonParser, async (req, res) => {
        /*
         #swagger.tags = ['ride']
         #swagger.description = 'To update information of current rides'
         #swagger.parameters['createRide'] = {
           in: 'body',
           description: 'Create new ride payload',
           required: true,
           schema: { $ref: "#/definitions/CreateRide" }
         }
         #swagger.responses[201] = {
                schema: { $ref: "#/definitions/CreateRideResponse" },
                description: 'Success create rider response.'
            },
         #swagger.responses[500] = {
                 schema: { $ref: "#/definitions/Error" },
                 description: 'Internal server error.'
         }
        */

        const payload = {
            startLatitude: Number(req.body.start_lat),
            startLongitude: Number(req.body.start_long),
            endLatitude: Number(req.body.end_lat),
            endLongitude: Number(req.body.end_long),
            riderName: req.body.rider_name,
            driverName: req.body.driver_name,
            driverVehicle: req.body.driver_vehicle,
        }

        const {code, body} = await rideService.createRide(db, payload)

        res.status(code).send(body)
    });

    app.get('/rides', async (req, res) => {
        /*
         #swagger.tags = ['ride']
         #swagger.description = 'To retrieve information about multiple rides'
         #swagger.responses[200] = {
                schema: { $ref: "#/definitions/RidesResponse" },
                description: 'Success get list of rides.'
            },
         #swagger.responses[500] = {
                 schema: { $ref: "#/definitions/Error" },
                 description: 'Internal server error.'
         }
        */

        const limit = req.query.perPage || 10
        const offset = req.query.pageNo || 0

        const {code, body} = await rideService.getRides(db, limit, offset)

        res.status(code).send(body)

    });

    app.get('/rides/:id', async (req, res) => {
        /*
         #swagger.tags = ['ride']
         #swagger.description = 'To retrieve information about specific rides'
         #swagger.responses[200] = {
                schema: { $ref: "#/definitions/RideResponse" },
                description: 'Success get list of rides.'
            },
         #swagger.responses[404] = {
                schema: { $ref: "#/definitions/Error" },
                description: 'Ride not found.'
            },
         #swagger.responses[500] = {
                 schema: { $ref: "#/definitions/Error" },
                 description: 'Internal server error.'
         }
        */

        const {code, body} = await rideService.getRideByID(db, req.params.id)
        res.status(code).send(body)

    });

    return app;
};
