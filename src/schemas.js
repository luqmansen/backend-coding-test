'use strict';

const migrateUp = (db) => {
    const createRideTableSchema = `
        CREATE TABLE Rides
        (
        rideID INTEGER PRIMARY KEY AUTOINCREMENT,
        startLat DECIMAL NOT NULL,
        startLong DECIMAL NOT NULL,
        endLat DECIMAL NOT NULL,
        endLong DECIMAL NOT NULL,
        riderName TEXT NOT NULL,
        driverName TEXT NOT NULL,
        driverVehicle TEXT NOT NULL,
        created DATETIME default CURRENT_TIMESTAMP
        )
    `;

    db.exec(createRideTableSchema);

    return db;
};

const migrateDown = (db) => {
    db.exec("DROP TABLE RIDES")
}

module.exports = {migrateUp, migrateDown}

