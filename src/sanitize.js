module.exports = {
  departures: data => {
    let returnData = {};

    for (busNumber in data) {
      returnData[busNumber] = data[busNumber].map(
        ({
          mode,
          line,
          line_name,
          direction,
          operator,
          date,
          expected_departure_date,
          aimed_departure_time,
          expected_departure_time,
          best_departure_estimate,
          operator_name
        }) => {
          return {
            mode,
              line,
              line_name,
              direction,
              operator,
              date,
              expected_departure_date,
              aimed_departure_time,
              expected_departure_time,
              best_departure_estimate,
              operator_name
          }
        }
      );
    }

    return returnData;
  }
};
