'use strict';


const sqlite3 = require('sqlite3')
const {open} = require('sqlite');

const {migrateUp, migrateDown} = require('../src/schemas');
const assert = require("assert").strict;
const {createRide, getRideByID, getRides} = require("../src/ride");

let db, app

describe('Ride Service tests', () => {
    before(async () => {
        sqlite3.verbose()
        db = await open({filename: ':memory:', driver: sqlite3.Database})
        app = require('../src/app')(db)
    })
    beforeEach(async () => {
        await migrateUp(db)
    });
    afterEach(async () => {
        await migrateDown(db)
    })

    describe('createRide', () => {
        it('bad startLat, should return validation error', async () => {
            let badPayload = {
                startLatitude: 102,
            }
            const res = await createRide(db, badPayload)
            assert.equal(res.code, 400)
            assert.deepEqual(res.body, {
                error_code: 'VALIDATION_ERROR',
                message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            })
        });

        it('bad endLatitude, should return validation error', async () => {
            let badPayload = {
                startLatitude: 90,
                endLatitude: -100,
            }
            const res = await createRide(db, badPayload)
            assert.equal(res.code, 400)
            assert.deepEqual(res.body, {
                error_code: 'VALIDATION_ERROR',
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            })
        });

        it('empty riderName, should return validation error', async () => {
            let badPayload = {
                startLatitude: 90,
                endLatitude: 90,
            }
            const res = await createRide(db, badPayload)
            assert.equal(res.code, 400)
            assert.deepEqual(res.body, {
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            })

        });

        it('empty rider name, should return validation error', async () => {
            let badPayload = {
                startLatitude: 90,
                endLatitude: 90,
                driverName: 'Yeet',
            }
            const res = await createRide(db, badPayload)
            assert.equal(res.code, 400)
            assert.deepEqual(res.body, {
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            })
        });

        it('empty driverVehicle, should return validation error', async () => {
            let badPayload = {
                startLatitude: 90,
                endLatitude: 90,
                driverName: 'Yeet',
                riderName: 'Rider'
            }
            const res = await createRide(db, badPayload)
            assert.equal(res.code, 400)
            assert.deepEqual(res.body, {
                error_code: 'VALIDATION_ERROR',
                message: 'Driver vehicle must be a non empty string'
            })
        });

        it('correct payload, should return success', async () => {
            const pl = {
                startLatitude: 90,
                endLatitude: 90,
                startLongitude: 100,
                endLongitude: 100,
                driverName: 'Yeet',
                riderName: 'Rider',
                driverVehicle: 'honda',
            }
            const res = await createRide(db, pl)
            assert.equal(res.code, 201)
        });

    });

    describe('getRideByID', () => {
        it('get non-existent id, should return 404', async () => {
            const res = await getRideByID(db, 1032)
            assert.equal(res.code, 404)
        });

        it('get existing id, should return 200', async () => {
            const pl = {
                startLatitude: 90,
                endLatitude: 90,
                startLongitude: 100,
                endLongitude: 100,
                driverName: 'Yeet',
                riderName: 'Rider',
                driverVehicle: 'honda',
            }
            await createRide(db, pl)
            const res = await getRideByID(db, 1)
            assert.equal(res.code, 200)
        });
    });

    describe('getRides', () => {
        it('return server error when given bad param', async () => {
            const res = await getRides(db, '10', "10 OR 1=1")
            assert.equal(res.code, 500)
        });

        it('empty rides, should return empty array', async () => {
            const res = await getRides(db, 10, 10)
            assert.deepEqual(res.body, [])
        });

        it('rides exists, should return success', async () => {
            const pl = {
                startLatitude: 90,
                endLatitude: 90,
                startLongitude: 100,
                endLongitude: 100,
                driverName: 'Yeet',
                riderName: 'Rider',
                driverVehicle: 'honda',
            }
            await createRide(db, pl)
            await createRide(db, pl)

            const res = await getRides(db, 10, 0)
            assert.equal(res.code, 200)
            assert.equal(res.body.length, 2)
        });
    });
})
;