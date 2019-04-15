const uuid = require("uuid-node");
const _ = require('lodash');

const API = require("./transportapi");
const Sanitize = require("./sanitize");

let clients = {};
let cache = {};

// group connections by ATCO code so we fetch data from the Transport API for each bus stop only once
module.exports = async (ctx, next) => {
  ctx.uuid = uuid.generateUUID();
  ctx.atco = ctx.query.atcocode;
  if (!clients[ctx.atco]) {
    clients[ctx.atco] = [];
  }
  clients[ctx.atco].push({ uuid: ctx.uuid, socket: ctx.websocket });

  // the newly connected client needs the latest data immediately
  const msg = await fetchDataForAtcoFromTransportApi(ctx.atco);
  cache[ctx.atco] = msg;
  ctx.websocket.send(JSON.stringify(msg));
  
  // when disconnect, find the connection to close in clients and delete
  ctx.websocket.on("close", data => {
    clients[ctx.atco] = clients[ctx.atco].filter(item => item.uuid !== ctx.uuid );
  });
}

// get deparetures data from cache
// try cache first, if it's not there go to the Transport API and update cache too
getDataForAtcoFromCache = (atco) => {
    return cache[atco];
}

// fetch deparetures data from the Transport API for a given bus stop
fetchDataForAtcoFromTransportApi = async(atco) => {
  const response = await API.departures(atco);
  const status = response.status;

  const msg =
    status == 200
      ? { response: Sanitize.departures(response.response.departures) }
      : { errors: [response.errors] };

  return msg;
}

emmitMessages = async () => {
  for(let atco in clients) {
    const msg = await fetchDataForAtcoFromTransportApi(atco);

    // if different value from cache then update and send
    if (!_.isEqual(cache[atco], msg)) {
      cache[atco] = msg;
      // send the data to everyone having subscribed to that ATCO
      for(let ws of clients[atco]) {
        ws.socket.send(JSON.stringify(msg));
      }
    }
  }
}

let intervalId = setInterval(emmitMessages, process.env.UPDATE_FREQUENCY);
