const express = require("express");
const mongoose = require("mongoose");
const shortUrls = require("./models/shortUrls");
const app = express();

const connectWithRetry = () => {
  return mongoose
    .connect("mongodb://localhost:27017/shortUrls", {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
      console.error("Failed to connect to MongoDB. Retrying in 5 seconds...");
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  const linkShortsData = await shortUrls.find();
  res.render("index", { linkShorts: linkShortsData });
});

app.post("/shortUrls", async (req, res) => {
  await shortUrls.create({ full: req.body.fullLink });

  res.redirect("/");
});

app.get("/:shortUrls", async (req, res) => {
  const urlData = await shortUrls.findOne({ short: req.params.shortUrls });

  if (urlData == null) return res.sendStatus(404);

  urlData.clicks++;
  urlData.save();

  res.redirect(urlData.full);
});

app.listen(process.env.PORT || 5000);
