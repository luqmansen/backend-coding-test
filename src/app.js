'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const logger = require('./logger')
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('../swagger.json')

module.exports = (db) => {

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))

    app.get('/health', (req, res) => {
        // #swagger.tags = ['health']
        // #swagger.description = 'To get current service health status'

        res.send('Healthy')
    });

    app.post('/rides', jsonParser, (req, res) => {
        /*
         #swagger.tags = ['ride']
         #swagger.description = 'To update information of current rides'
         #swagger.parameters['createRide'] = {
           in: 'body',
           description: 'Create new ride payload',
           required: true,
           schema: { $ref: "#/definitions/CreateRide" }
         }
         #swagger.responses[200] = {
                schema: { $ref: "#/definitions/CreateRideResponse" },
                description: 'Success create rider response.'
            },
         #swagger.responses[500] = {
                 schema: { $ref: "#/definitions/Error" },
                 description: 'Internal server error.'
         }
        */

        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            return res.status(400).send({
                error_code: 'VALIDATION_ERROR',
                message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            return res.status(400).send({
                error_code: 'VALIDATION_ERROR',
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            return res.status(400).send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            return res.status(400).send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            return res.status(400).send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];
        
        const result = db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
            if (err) {
                logger.error(err)
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
                if (err) {
                    logger.error(err)
                    return res.status(500).send({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error'
                    });
                }

                res.status(201).send(rows);
            });
        });
    });

    app.get('/rides', (req, res) => {
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

        db.all('SELECT * FROM Rides', function (err, rows) {
            if (err) {
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.status(404).send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });

    app.get('/rides/:id', (req, res) => {
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
        db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.status(404).send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });

    return app;
};
