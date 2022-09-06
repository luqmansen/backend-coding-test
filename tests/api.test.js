'use strict';

const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(':memory:');
const app = require('../src/app')(db);
const {migrateUp, migrateDown} = require('../src/schemas');
const assert = require("assert");

describe('API tests', () => {
    beforeEach((done) => {
        db.serialize((err) => {
            if (err) {
                return done(err);
            }
            migrateUp(db);
            done()
        });
    });
    afterEach(() => {
        migrateDown(db)
    })

    describe('GET /health', () => {
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });
    });

    describe('POST /rides', () => {
        it('bad start_lat, should return validation error', (done) => {
            let badPayload = {
                start_lat: 102,
            }
            request(app)
                .post('/rides')
                .send(badPayload)
                .expect(400)
                .expect({
                    error_code: 'VALIDATION_ERROR',
                    message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
                }).end(done);
        });

        it('empty driver_vehicle field, should return validation error', (done) => {
            let badPayload = {
                start_lat: 90,
                start_long: 170.7893,
                end_lat: 89.191,
                end_long: 170.7893,
                rider_name: 'Jhon',
                driver_name: 'Doe',
            }
            request(app)
                .post('/rides')
                .send(badPayload)
                .expect(400)
                .expect({
                    error_code: 'VALIDATION_ERROR',
                    message: 'Rider name must be a non empty string'
                }).end(done);
        });

        it('should return resource created', (done) => {
            let payload = {
                start_lat: 90,
                start_long: 170.7893,
                end_lat: 89.191,
                end_long: 170.7893,
                rider_name: 'Jhon',
                driver_name: 'Doe',
                driver_vehicle: 'Yamaha'
            }
            request(app)
                .post('/rides')
                .send(payload)
                .expect(201, done);
        });
    });

    describe('GET /rides', () => {
        it('should return empty result', (done) => {
            request(app)
                .get('/rides')
                .expect(404, done);
        });

        it('should return non-empty result', (done) => {
            let payload = {
                start_lat: 90,
                start_long: 170.7893,
                end_lat: 89.191,
                end_long: 170.7893,
                rider_name: 'Jhon',
                driver_name: 'Doe',
                driver_vehicle: 'Yamaha'
            }
            request(app)
                .post('/rides')
                .send(payload)
                .expect(201)
                .then(async () => {
                    request(app)
                        .get('/rides')
                        .expect(200, done);
                })
        });
    });

    describe('GET /rides/:id', () => {
        it('should return empty result', (done) => {
            request(app)
                .get('/rides/123')
                .expect(404, done);
        });

        it('should return a ride with matching ID result', (done) => {
            let payload = {
                start_lat: 90,
                start_long: 170.7893,
                end_lat: 89.191,
                end_long: 170.7893,
                rider_name: 'Jhon',
                driver_name: 'Doe',
                driver_vehicle: 'Yamaha'
            }
            request(app)
                .post('/rides')
                .send(payload)
                .expect(201)
                .then(async () => {
                    request(app)
                        .get('/rides/1')
                        .expect(200)
                        .expect((res) => {
                            assert(res.body[0].rideID, 1)
                        }).end(done);
                })
        });
    });

});