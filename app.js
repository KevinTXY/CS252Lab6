var express = require("express");
var firebase = require("firebase");
var bodyParser = require("body-parser");
var url = require("url");
var User = require("./User.js");
var port = process.env.PORT || 3000;
var path = require("path");
var app = express();

app.use(express.static(path.join(__dirname, "static")));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

const config = JSON.parse(process.env.firebaseConfig);
firebase.initializeApp(config);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/static/LoginScreen.html");
});

app.get("/Meet", function(req, res) {
  res.sendFile(__dirname + "/static/Meet.html");
});

// Open Loading Screen after getting coordinates
app.post("/Meet", function(req, res) {
  // Put Coordinate and Movie in the Database along with User Name
  let database = firebase.database();
  let dbRef = database.ref();
  let movie = req.body.movie;
  let emailId = req.body.email;
  let coordinates = req.body.coordinates;

  // Get Node with all users
  let MovieRef = dbRef.child("Movie");
  // Order List by EmailId and search for email id of user
  var MovieInfo = { Movie: movie, EmailId: emailId, Coordinates: coordinates };
  MovieRef.orderByChild("Movie")
    .equalTo(movie)
    .once("value", function(snapshot) {
      let movieKey = null;
      if (!snapshot.exists()) {
        movieKey = MovieRef.push().key;
      } else {
        movieKey = Object.keys(snapshot.val())[0]; // Unique for the particular movie entry generated by firebase
      }
      let movieObject = {};
      movieObject["/Movie/" + movieKey] = MovieInfo;
      // Update the Movie enteries
      firebase
        .database()
        .ref()
        .update(movieObject, function() {
          console.log("Movie Details Updated/Added Successfully");
        });
    });

  let Url = url.format({
    pathname: "/Loading",
    query: {
      email: emailId,
      movie: movie
    }
  });

  // Go to Loading.html
  res.json({ redirect: Url });
});

app.get("/Loading", function(req, res) {
  console.log("Hello World");
  console.log(req.query.email);
  res.sendFile(__dirname + "/static/Loading.html");
});

app.post("/coordinates", function(req, res) {
  // Retrieve the two coordinates take average and send it into a JSON
  let emailId = req.body.email;
  let movie = req.body.movie;
  let database = firebase.database();
  let dbRef = database.ref();
  // Get Node with all users
  let coordinateRef = dbRef.child("coordinates");
  // Returns Promise
  // Order List by EmailId and search for email id of user
  let startTime = new Date().getTime();
  while (!snapshot.exists() || new Date.getTime() - startTime > 60000) {
    coordinateRef
      .orderByChild("Movie") // Find by Movie
      .equalTo(movie)
      .once("value", function(snapshot) {
        // For Each Snapshort Resolve Promise Firebase does not know if there is only entry after search
        snapshot.forEach(function(childSnapshot) {
          let value = childSnapshot.val(); // Contains the JSON Body that has coordinates
          console.log(value);
        });
      });
  }
});

app.listen(port, function() {
  console.log(`Example app listening on port ` + port);
});
