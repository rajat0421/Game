const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRouter = require("./routes/user.router");
const roomRouter = require("./routes/room.router");
const guessRouter = require("./routes/guess.router");
const dailyRouter = require("./routes/daily.router");
const adminRouter = require("./routes/admin.router");

app.use(express.json());
app.use(cookieParser());

const frontendUrl = process.env.FRONTEND_URL;
app.use(
  cors({
    origin: frontendUrl || true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/user", userRouter);
app.use("/room", roomRouter);
app.use("/guess", guessRouter);
app.use("/daily", dailyRouter);
app.use("/admin", adminRouter);

module.exports = app;