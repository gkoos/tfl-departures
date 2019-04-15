const fetch = require("node-fetch");

const baseUrl = "http://transportapi.com";

const nearbyStopsUrl = "/v3/uk/places.json";
const busDepartureUrl = "/v3/uk/bus/stop/{code}/live.json";

fetchApiData = async url => {
  try {
    const response = await fetch(url);
    const responseBody = await response.json();

    if (response.status != 200) {
      return {status: response.status, errors: [ responseBody.error ]};
    }
    else {
      return {status: response.status, response: responseBody};
    }
  }
  catch(e) {
    return {status: 500, response: {errors: [e.message]}};
  }
};

module.exports = {
  fetchNearbyStops: async (lat, long, type) => {
    if (type === "all" || !type) {
      type = "bus_stop,train_station,tube_station";
    }

    const url = `${baseUrl}${nearbyStopsUrl}?lat=${lat}&lon=${long}&type=${type}&app_id=${process.env.APP_ID}&app_key=${process.env.APP_KEY}`;
    return await fetchApiData(url);
  },

  departures: async (atcoCode) => {
    const url = `${baseUrl}${busDepartureUrl}?app_id=${process.env.APP_ID}&app_key=${process.env.APP_KEY}`.replace("{code}", atcoCode);
    return await fetchApiData(url);
  }
};
