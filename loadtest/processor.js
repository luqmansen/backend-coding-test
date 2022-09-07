const {faker} = require('@faker-js/faker');

function random(min, max) {
    return Math.floor((Math.random()) * (max - min + 1)) + min;
}

function getLimitAndOffset(requestParams, ctx, ee, next) {
    const perPage = random(0, 100)
    ctx.vars["perPage"] = perPage
    ctx.vars["pageNo"] = random(0, perPage)

    return next();
}

function setRideID(request, ctx, ee, next) {
    if (ctx.vars["resources"].length <= 1) {
        ctx.vars["rideID"] = random(1, 2);
        return next();
    }

    const randomIndex = random(1, ctx.vars["resources"].length - 1);
    ctx.vars["rideID"] = ctx.vars["resources"][randomIndex].rideID;

    return next();
}

function generateRidePayload(request, ctx, ee, next) {
    ctx.vars["start_lat"] = random(-90, 90)
    ctx.vars["start_long"] = random(-180, 180)
    ctx.vars["end_lat"] = random(-90, 90)
    ctx.vars["end_long"] = random(-180, 180)
    ctx.vars["rider_name"] = faker.name.firstName()
    ctx.vars["driver_name"] = faker.name.firstName()
    ctx.vars["driver_vehicle"] = faker.vehicle.model()

    return next()
}

module.exports = {
    getLimitAndOffset, generateRidePayload, setRideID
};