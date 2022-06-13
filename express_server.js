const express = require("express")
const morgan = require('morgan')
// in order to make post buffer readable
const bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.urlencoded({extended: true}))
//use morgan middleware
app.use(morgan('dev'))
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// GENERATES RANDOM STRINGS FOR SHORTURL
const generateRandomString = function (database) {
  let randomNumberArray = [];
  do {
    for (let i = 0; i < 6; i++) {
      randomNumberArray.push(Math.floor(Math.random() * 62));
    }
  } while (database[randomNumberArray.join('')] !== undefined);
  return randomNumberArray.map((item) => {
    if (item >= 0 && item <= 9) {
      return String.fromCharCode(item + 48); //0-9 gives numbers 0-9
    } else if (item >= 10 && item <= 35) {
      return String.fromCharCode(item + 55); //10-35 gives A-Z
    } else { // 36 - 61 gives a-z
      return String.fromCharCode(item + 61);
    }
  }).join('');
};

//ejs
app.set("view engine", "ejs");

//just demo useless
app.get("/hello", (req, res) => {
  const templateVars = {greeting: 'Hello World!'};
  res.render("hello_world", templateVars);
});

app.get("/", (req, res) => {
  const templateVars = {greeting: 'Hello World!'};
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase}
  res.render("urls_index", templateVars);
});
// deal form request
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
