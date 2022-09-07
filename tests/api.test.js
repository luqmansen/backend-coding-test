'use strict';


const supertest = require('supertest');

const sqlite3 = require('sqlite3')
const {open} = require('sqlite');


const {migrateUp, migrateDown} = require('../src/schemas');
const assert = require("assert").strict;
const {createRide} = require("../src/ride");

let db, app

describe('API tests', () => {
    before(async () => {
        sqlite3.verbose()
        db = await open({filename: ':memory:', driver: sqlite3.Database})
        app = require('../src/app')(db)
    })
    after(async ()=>{
        await db.close()
    })

    beforeEach(async () => {
        await migrateUp(db)
    });
    afterEach(async () => {
        await migrateDown(db)
    })

    describe('GET /health', () => {
        it('should return health', (done) => {
            supertest(app)
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
            supertest(app)
                .post("/rides")
                .send(badPayload)
                .expect(400)
                .expect({
                    error_code: 'VALIDATION_ERROR',
                    message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
                }).end(done);
        });

        it('empty driver_vehicle field, should return validation error', (done) => {
            const badPayload = {
                start_lat: 90,
                start_long: 170.7893,
                end_lat: 89.191,
                end_long: 170.7893,
                rider_name: 'Jhon',
                driver_name: 'Doe',
            }
            supertest(app)
                .post('/rides')
                .send(badPayload)
                .expect(400)
                .expect({
                    error_code: 'VALIDATION_ERROR', message: 'Driver vehicle must be a non empty string'
                }).end(done);
        });

        it('should return resource created', (done) => {
            const payload = {
                start_lat: 90,
                start_long: 170.7893,
                end_lat: 89.191,
                end_long: 170.7893,
                rider_name: 'Jhon',
                driver_name: 'Doe',
                driver_vehicle: 'Yamaha'
            }
            supertest(app)
                .post("/rides")
                .send(payload)
                .expect(201)
                .end(done);
        });
    });

    describe('GET /rides', () => {
        it('should return empty result', (done) => {
            supertest(app)
                .get('/rides')
                .expect(200)
                .expect([])
                .end(done);
        });

        it('should return non-empty result', (done) => {
            const payload = {
                startLatitude: 90,
                startLongitude: 170.7893,
                endLatitude: 89.191,
                endLongitude: 170.7893,
                riderName: 'Jhon',
                driverName: 'Doe',
                driverVehicle: 'Yamaha'
            }
            createRide(db, payload).then(() => {
                supertest(app)
                    .get('/rides')
                    .expect((res) => {
                        assert.equal(res.status, 200)
                        assert.equal(res.body.length, 1)
                        assert.equal(res.body[0].rideID, 1)
                    })
                    .end(done)
            })


        });

        it('should return correctly paged result', (done) => {
            const payload = {
                startLatitude: 90,
                startLongitude: 170.7893,
                endLatitude: 89.191,
                endLongitude: 170.7893,
                riderName: 'Jhon',
                driverName: 'Doe',
                driverVehicle: 'Yamaha'
            }
            let toCreate = []
            for (let i = 0; i < 20; i++) {
                toCreate.push(createRide(db, payload))
            }

            Promise.all(toCreate)
                .then(
                    supertest(app)
                        .get("/rides?perPage=10&pageNo=0")
                        .expect((res) => {
                            assert.equal(res.status, 200)
                            assert.equal(res.body.length, 10)
                            assert.equal(res.body[0].rideID, 1)
                        }).end(done)
                )
        });
    });

    describe('GET /rides/:id', () => {
        it('should return empty result', () => {
            supertest(app)
                .get('/rides/121233')
                .expect(404).expect((resp) => {
                console.log(resp)
            })
        });

        it('should return a ride with matching ID result',  (done) => {
            const payload = {
                startLatitude: 90,
                startLongitude: 170.7893,
                endLatitude: 89.191,
                endLongitude: 170.7893,
                riderName: 'Jhon',
                driverName: 'Doe',
                driverVehicle: 'Yamaha'
            }

            createRide(db, payload).then(
                supertest(app)
                    .get('/rides/1')
                    .expect(200)
                    .expect((res) => {
                        assert.equal(res.body.rideID, 1)
                    }).end(done)
            )
        });
    });

});