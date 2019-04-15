latitude = lat => !isNaN(+lat) && +lat >= -90 && +lat <= 90;

longitude = long => !isNaN(+long) && +long >= -180 && +long <= 180;

checkType = type => ["bus_stop", "train_stop", "tube_station", "all"].includes(type);

atcoCode = atcoCode => /^[0-9a-z]{5,25}$/i.test(atcoCode);

checkMissingRequiredParams = (requiredParams, params) => {
  let missingParams = [];
  for (k of requiredParams) {
    if (!(k in params)) {
      missingParams.push(k);
    }
  }
  return missingParams;
};

composeMissingParamsMessage = missingReqParams => {
  if (missingReqParams && missingReqParams.length) {
    const missingParams = missingReqParams.join();
    const message =
      "Missing param" +
      (missingReqParams.length > 1 ? "s" : "") +
      ": " +
      missingParams;

    return message;
  }
};

module.exports = {
  nearbyStops: params => {
    let errors = [];

    const missingReqParams = checkMissingRequiredParams(["lat", "long"], params);
    if (missingReqParams.length) {
      errors.push(composeMissingParamsMessage(missingReqParams));
    }

    const lat = +params.lat;
    const long = +params.long;
    const type = params.type;

    if (('lat' in params) && !latitude(lat)) {
      errors.push("Malformed parameter lat");
    }

    if (('long' in params) && !latitude(long)) {
      errors.push("Malformed parameter long");
    }

    if (type && !checkType(type)) {
      errors.push("Wrong type given");
    }

    const hasErrors = !!errors.length;
    return { hasErrors, errors };
  },

  departures: params => {
    let errors = [];

    const missingReqParams = checkMissingRequiredParams(["atcocode"], params);
    if (missingReqParams.length) {
      errors.push(composeMissingParamsMessage(missingReqParams))
    }
    else if (!atcoCode(params.atcocode)) {
      errors.push("Malformed ATCO code");
    }

    const hasErrors = !!errors.length;
    return { hasErrors, errors };
  }
};
