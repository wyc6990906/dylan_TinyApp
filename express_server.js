const express = require("express")
const morgan = require('morgan')
const cookieParser = require("cookie-parser")
// in order to make post buffer readable
const bodyParser = require('body-parser')
const app = express();
// Basic settings
//ejs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}))
//use morgan middleware to log bugs
app.use(morgan('dev'))
//cookie parser
app.use(cookieParser())
const PORT = 8080; // default port 8080

//fake url database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
//fake user database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
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


//register
app.get("/register", (req, res) => {
  // const templateVars = {greeting: 'Hello World!'};
  const id = req.cookies['user_id']
  const templateVars = {urls: urlDatabase, user: users[id],}
  res.render("register", templateVars);
});

//login
app.get('/login', (req, res) => {
  const templateVars = {
    user: null
  };
  res.render('login', templateVars);
});


// main page show all the urls
app.get("/urls", (req, res) => {
  const id = req.cookies['user_id']
  const templateVars = {urls: urlDatabase, user: users[id],}
  res.render("urls_index", templateVars);
});

// Create New URLs(long)
app.get("/urls/new", (req, res) => {
  const id = req.cookies['user_id']
  const templateVars = {user: users[id],}
  res.render("urls_new", templateVars);
});

//view short URLs
app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies['user_id']
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[id]
  };
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
// deal register
app.post("/register", (req, res) => {
  // console.log('register Handler========', req.body)
  const id = generateRandomString(users)
  const {email, password} = req.body
  //email used already check
  for (const key in users) {
    if(users[key].email === email){
      res.send('This email already beed used!')
      return
    }
  }
  // no possible
  if(email === '' || password === '' || email === undefined || password === undefined){
    res.send(400)
  }
  const user = {id, email, password}
  users[id] = user
  // console.log(users)
  res.cookie('user_id', id)
  res.redirect('/urls')
})


//deal login
app.post("/login", (req, res) => {
  // console.log('login Handler========', req.body)
  const id = generateRandomString(users)
  res.cookie('user_id', id)
  res.redirect('/urls')
})

//deal logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/register')
})

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


app.listen(PORT, () => {
  console.log(`Dylan's URL TinyApp listening on port ${PORT}!`);
});
