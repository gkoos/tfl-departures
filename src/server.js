const Koa = require("koa");
const serve = require("koa-static");
const websockify = require("koa-websocket");

require("dotenv").config();

const router = require("./routes");
const socketServer = require("./socketserver");

const app = websockify(new Koa());

app.ws.use(socketServer);

app
  .use(serve("./src/public"))
  .use(router.routes())
  .use(router.allowedMethods())
  .on("error", e => console.log(`ERROR: ${e.message}`));

const port = process.env.PORT || process.env.DEFAULT_PORT;
app.listen(port, function() {
  console.log(`Server running on port ${port}`);
});
