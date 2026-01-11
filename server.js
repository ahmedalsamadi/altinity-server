const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/users", require("./routes/users"));

app.use("/api/posts", require("./routes/posts"));
app.use("/api/profiles", require("./routes/profiles"));
connectDB();

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.send("Hello from Altinity Server");
});
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log("server has started on port " + port);
});
