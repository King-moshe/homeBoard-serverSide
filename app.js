const express = require("express");
// Extract the filename from a file path
const path = require("path");
const http = require("http");
// Create an HTTP server that listens to server ports and gives a response back to the client.
const fileUpload = require("express-fileupload");

const cors = require("cors");

const bodyParser = require('body-parser');


const {routesInit} = require("./routes/configRoutes");
require("./db/mongoConnect");

const app = express();



app.use(fileUpload({
    limits: { fileSize: 1024 * 1024 * 5}
}))

app.use(cors());

require('dotenv').config();


app.use(express.json());

app.use(express.static(path.join(__dirname,"public")));

app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());


routesInit(app);


const server = http.createServer(app);

let port = process.env.PORT || 3002;

server.listen(port);
