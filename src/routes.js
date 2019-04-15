const Router = require("koa-router");
const Validators = require("./validators");
const API = require("./transportapi");
const Sanitize = require("./sanitize");

const router = new Router();

router.get("/api/nearby-stops", async (ctx, next) => {
  const errors = Validators.nearbyStops(ctx.query);
  if (errors.hasErrors) {
    ctx.status = 400;
    ctx.body = { errors: errors.errors };
    return;
  }

  const { lat, long, type } = ctx.query;
  const response = await API.fetchNearbyStops(lat, long, type);

  ctx.status = response.status;
  delete response.status;
  ctx.body =
    ctx.status == 200
      ? { response: response.response.member }
      : { errors: [response.errors] };
});

router.get("/api/departures", async (ctx, next) => {
  const errors = Validators.departures(ctx.query);
  if (errors.hasErrors) {
    ctx.status = 400;
    ctx.body = { errors: errors.errors };
    return;
  }

  const { atcocode } = ctx.query;
  const response = await API.departures(atcocode);

  ctx.status = response.status;

  const responseBody =
    ctx.status == 200
      ? { response: Sanitize.departures(response.response.departures) }
      : { errors: [response.errors] };

  delete response.status;
  ctx.body = responseBody;
});

module.exports = router;
