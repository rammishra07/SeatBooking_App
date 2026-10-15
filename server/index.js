const app = require("./src/app");
const { connectDatabase } = require("./src/config/database");
const { assertRequiredEnv, mongoUri, port } = require("./src/config/env");

async function start() {
  assertRequiredEnv();
  await connectDatabase(mongoUri);
  app.listen(port, () => console.log(`SeatBooking API listening on port ${port}`));
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
