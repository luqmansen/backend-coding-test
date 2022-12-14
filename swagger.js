const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger.json'
const endpointsFiles = ['./src/app.js']

const doc = {
  info: {
    version: '1.0.0',
    title: 'Xendit Coding Test',
    description: 'Documentation automatically generated by the <b>swagger-autogen</b> module.'
  },
  host: 'localhost:8010',
  basePath: '/',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  definitions: {
    Error: {
      error_code: 'SERVER_ERROR',
      message: 'Unknown error'
    },
    CreateRide: {
      start_lat: 89.191,
      start_long: 170.7893,
      end_lat: 89.191,
      end_long: 170.7893,
      rider_name: 'Jhon',
      driver_name: 'Doe',
      driver_vehicle: 'Yamaha'
    },
    RideResponse: {
      startLat: 89.191,
      startLong: 170.7893,
      endLat: 89.191,
      endLong: 170.7893,
      rider_name: 'Jhon',
      driver_name: 'Doe',
      driver_vehicle: 'Yamaha'
    },
    RidesResponse: [{
      startLat: 89.191,
      startLong: 170.7893,
      endLat: 89.191,
      endLong: 170.7893,
      rider_name: 'Jhon',
      driver_name: 'Doe',
      driver_vehicle: 'Yamaha'
    }],
    CreateRideResponse: {
      rideID: 23,
      startLat: 0.7893,
      startLong: 113.9213,
      endLat: 103.89,
      endLong: 103.89,
      riderName: 'Jhon',
      driverName: 'Doe',
      driverVehicle: 'Suzuki',
      created: '2022-09-05 14:42:17'
    }
  }

}

swaggerAutogen(outputFile, endpointsFiles, doc)
