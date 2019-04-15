# Departure Times
(Almost) real-time departure times for public transportation (currently for buses only) in the UK, using [TransportAPI](http://transportapi.com). The app is also deployed on [Heroku](...).

## Backend
The backend is implemented in Node.js using the [koa](https://koajs.com/) framework. Koa has a smaller footprint than Express, therefore ideal for tiny apps like this.

### Endpoints

#### General format

The endpoints return json data with `Content-type: application/json; charset=utf-8` header.  
Response status: 200 if everything is fine, 400 if the query parameter validation fails, 500 or whatever comes back from the Transport API if an error occurs on their end.  
Response format: in case of errors an array with the `errors` key is returned (there can be multiple validation errors). If everything went well, the response has a `response` key containing the data.

For example `http://localhost:3000/api/nearby-stops?lat=251.534121&long=-0.006944&type=airport` gives
```
Status: 400

{
    "errors": [
        "Malformed parameter lat",
        "Wrong type given"
    ]
}
```

#### GET /api/nearby-stops?lat=...&long=...&type=...
lat, long REQUIRED - geocoordinates  
type - bus_stop | train_station | tube_station | all (default)  
Retrieves data for the nearby stops / stations.  
Response:  
```
GET /api/nearby-stops?lat=51.534121&long=-0.006944&type=bus_stop  
Status: 200

{
    "response": [
        {
            "type": "bus_stop",
            "name": "Abbey Lane (Stop L) - SW-bound",
            "description": "Stratford, London",
            "latitude": 51.53378,
            "longitude": -0.00727,
            "accuracy": 20,
            "atcocode": "490003025W",
            "distance": 43
        },
        ...
```


#### GET /api/departures?atcocode=...
atcocode REQUIRED - ATCO code of the bus stop.  
Retrieves live departures data for the bus stop with the given ATCO code.  
ATCO codes are short alphanumeric codes for identifying bus stops in the UK. They are used as unique identifiers by the Transport API.   
**Note that this call only works for bus stops, as only those have ATCO codes!**  
This only gives a snapshot of the live departures but it can be used to fetch semi-realtime data with short or long polling on the frontend.  
Response:  
```
GET /api/departures?atcocode=490003025W  
Status: 200  

{
    "response": {
        "25": [
            {
                "mode": "bus",
                "line": "25",
                "line_name": "25",
                "direction": "St. Paul's",
                "operator": "TN",
                "date": "2019-04-14",
                "expected_departure_date": "2019-04-14",
                "aimed_departure_time": "23:25",
                "expected_departure_time": "23:28",
                "best_departure_estimate": "23:28",
                "operator_name": "TOWER TRANSIT LIMITED"
            },
            {
                "mode": "bus",
                "line": "25",
                "line_name": "25",
                "direction": "City Thameslink",
                "operator": "TN",
                "date": "2019-04-14",
                "expected_departure_date": "2019-04-14",
                "aimed_departure_time": "23:35",
                "expected_departure_time": "23:35",
                "best_departure_estimate": "23:35",
                "operator_name": "TOWER TRANSIT LIMITED"
            }
        ],
        ...
    }
```

### Websockets

ws:// /?atcocode=...
The websocket version of the GET /api/departures API call. Under the hood it polls the Transport API in a time period specified in the `.env` file and if there were any changes the new data is sent to the websocket connections subscribing to the given bus station. The data is also sent to every new connection anyway so the frontend gets some initial data.

### TODO
- Refactor socketserver.js
- Use some library for parameter validation.
- Use Bluebird promises to handle timeouts.
- Add trains. Train stations can be identified by CRS codes (exactly 3 chars) and the /v3/uk/train/station/{code}/live.json Transport API call can be used.
- Scaling. Using a cache layer (Redis for example) multiple server instances can run. In fact, it is possible right now, but would be slightly inefficient.
- More tests. I know.
- Rewrite validator tests to be more flexible regarding the order of error messages.


## Frontend
Yes, I have every intention of making a simple frontend to the API where clicking a POI displays the nearby bus stops / train stations and selecting one of them show the live departures in real time using websockets.  
For now it's just a placeholder static server added to the backend.