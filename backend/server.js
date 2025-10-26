const app = require('./src/app');
require('dotenv').config();
const connectDB = require('./src/db/db');

connectDB();

app.get("/", (req, res) => {
  res.send("started");
})


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
