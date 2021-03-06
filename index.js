var express = require('express');
var path = require('path');
const bodyParser=require("body-parser");

// Import Routes
var main=require("./routes/main")
var admin=require("./routes/admin")
var registration_details=require("./routes/registration_details")

var app = express();

// Body Parsers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

// set route
app.use("/",main);
app.use("/admin",admin);
app.use("/admin/registration_details",registration_details);

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });