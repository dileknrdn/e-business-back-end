const express = require("express");
const routes = require("./routes");
// import sequelize connection
const sequelize = require("./config/connection");

// import the models
//const { Category, Product, ProductTag, Tag } = require('./models');

// create the express app
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

// sync sequelize models to the database, then turn on the server
sequelize.sync({ force: false }).then(() => {
  console.log("Database synced");
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
  });
});
