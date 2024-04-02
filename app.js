const express = require("express");
const server = express();

const bodyParser = require("body-parser");
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const handlebars = require("express-handlebars");
server.set("view engine", "hbs");
server.engine(
    "hbs",
    handlebars.engine({
        extname: "hbs",
        helpers: {
            increment: function (index) {
                return index + 1;
            },
            desk: function (index) {
                return index % 9 === 0;
            },
            space: function (index) {
                return (index + 1) % 3 === 0 && (index + 1) % 9 != 0;
            }
        }
    })
);

server.use(express.static("public"));
const mongo_uri = 'mongodb+srv://john_doe:labtech@labreservation.yicebdj.mongodb.net/labreservation?retryWrites=true&w=majority&appName=LabReservation';
const mongoose = require('mongoose');
mongoose.connect(mongo_uri);

const session = require('express-session');
const mongoStore = require('connect-mongodb-session')(session);

server.use(session({
    secret: 'DLSU',
    saveUninitialized: true,
    resave: false,
    store: new mongoStore({
        uri: mongo_uri,
        collection: 'sessions',
        expires: 21*24*60*60*1000
    })
}));

const controllers = ['routes'];
for (var i = 0; i < controllers.length; i++) {
    const ctrl = require('./controllers/' + controllers[i]);
    ctrl.add(server);
}

function finalClose() {
    mongoose.connection.close();
    process.exit();
}

process.on('SIGTERM', finalClose);
process.on('SIGINT', finalClose);
process.on('SIGQUIT', finalClose);

const port = process.env.PORT | 3000;
server.listen(port, function () {
    console.log("Listening at port " + port);
});
