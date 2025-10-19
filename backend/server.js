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


//rajattalekar5143_db_user
//J44d8pMFbjdUhbOk

// mongodb+srv://rajattalekar5143_db_user:J44d8pMFbjdUhbOk@cluster0.djctnd1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0