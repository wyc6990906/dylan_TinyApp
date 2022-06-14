const express = require("express")
const morgan = require('morgan')
// in order to make post buffer readable
const bodyParser = require('body-parser')
const app = express();

// Basic settings
//ejs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}))
//use morgan middleware to log bugs
app.use(morgan('dev'))
const PORT = 8080; // default port 8080

//fake database
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


/* GET REQUESTS*/
//just demo useless
app.get("/hello", (req, res) => {
  const templateVars = {greeting: 'Hello World!'};
  res.render("hello_world", templateVars);
});
// Redirects to the urls page if no address is defined
app.get("/", (req, res) => {
  res.redirect('/urls')
});

// main page show all the urls
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase}
  res.render("urls_index", templateVars);
});

// Create New URLs(long)
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//view short URLs
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});


// Redirect to longURL //
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (!shortURL || !longURL) {
    res.send('There is no record of this url address!')
  }
  res.redirect(longURL);
});


/* POST REQUESTS*/
// deal form request
app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString(urlDatabase)
  urlDatabase[shortURL] = req.body.longURL
  // console.log(urlDatabase)  //add new urlObject to database
  // console.log(shortURL)
  res.redirect(`/urls/${shortURL}`)
})

//delete url resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const {shortURL} = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

app.post("/urls/:id", (req, res) => {

})


app.listen(PORT, () => {
  console.log(`Dylan's URL TinyApp listening on port ${PORT}!`);
});
