const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = require("./src/app");
const connectDB = require("./src/db/db");

connectDB();

const PORT = Number(process.env.PORT) || 3000;

app.get("/", (req, res) => {
  res.json({
    service: "word-game-api",
    modes: ["GET /daily/meta — global daily puzzle", "POST /room/create — private rooms"],
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
