const logger = require("./logger");


const createRide = async (db, payload) => {
    const {
        startLatitude, startLongitude, endLatitude, endLongitude, riderName, driverName, driverVehicle
    } = payload

    if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
        return {
            code: 400, body: {
                error_code: 'VALIDATION_ERROR',
                message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            }
        };
    }

    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
        return {
            code: 400, body: {
                error_code: 'VALIDATION_ERROR',
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            }
        };
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
        return {
            code: 400, body: {
                error_code: 'VALIDATION_ERROR', message: 'Rider name must be a non empty string'
            }
        };
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
        return {
            code: 400, body: {
                error_code: 'VALIDATION_ERROR', message: 'Driver name must be a non empty string'
            }
        };
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
        return {
            code: 400, body: {
                error_code: 'VALIDATION_ERROR', message: 'Driver vehicle must be a non empty string'
            }
        };
    }

    const values = [startLatitude, startLongitude, endLatitude, endLongitude, riderName, driverName, driverVehicle];
    const query = 'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)'

    let lastID
    try {
        const res = await db.run(query, values)
        lastID = res.lastID
    } catch (err) {
        logger.error(err.message)
        return {
            code: 500, body: {
                error_code: 'SERVER_ERROR', message: 'Unknown error'
            }
        };
    }

    try {
        const rows = await db.get('SELECT * FROM Rides WHERE rideID = ?', lastID)

        return {code: 201, body: rows};
    } catch (err) {
        logger.error(err.message)
        return {
            code: 500, body: {
                error_code: 'SERVER_ERROR', message: 'Unknown error'
            }
        };
    }
}

const getRideByID = async (db, id) => {
    try {
        const rows = await db.get('SELECT * FROM Rides WHERE rideID = ?', id)
        if (rows === undefined) {
            return {
                code: 404, body: {
                    error_code: 'RIDES_NOT_FOUND_ERROR', message: 'Could not find any rides'
                }
            }
        }
        return {code: 200, body: rows}
    } catch (err) {
        logger.error(err.message)
        return {
            code: 500, body: {
                error_code: 'SERVER_ERROR', message: 'Unknown error'
            }
        }
    }
}

const getRides = async (db, limit, offset) => {

    // validation is commented to demonstrate that this query is safe from sql injection

    // limit = parseInt(limit)
    // offset = parseInt(offset)
    // if (typeof limit !== 'number' || typeof offset !== 'number' || isNaN(offset) || isNaN(limit)) {
    //     return {
    //         code: 400, body: {
    //             error_code: 'BAD_REQUEST', message: 'Invalid params type'
    //         }
    //     }
    // }

    const query = "SELECT * FROM Rides LIMIT ? OFFSET ?"

    try {
        const rows = await db.all(query, limit, offset)
        return {code: 200, body: rows}

    } catch (err) {
        logger.error(err.message)
        return {
            code: 500, body: {
                error_code: 'SERVER_ERROR', message: 'Unknown error'
            }
        }
    }
}

module.exports = {
    createRide, getRideByID, getRides
}