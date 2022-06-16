const express = require("express")
const morgan = require('morgan')
// const cookieParser = require("cookie-parser")
const cookieSession = require('cookie-session');
// in order to make post buffer readable
const bodyParser = require('body-parser')
//  hash password
const bcrypt = require('bcryptjs');
// set my own favicon
const favicon = require('serve-favicon')
const path = require('path')
//  method-override
const methodOverride = require('method-override')
const app = express();
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(methodOverride("_method"));
const {getUser, generateRandomString, urlsForUser, getUniqueVisitorCount, registerUser} = require('./helper/helper')
//Set global variables for /urls/:shortURL endpoint statistics
let clicks = 0;
let visitorCount = 0
// Basic settings
//ejs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}))
//use morgan middleware to log bugs
app.use(morgan('dev'))
//cookie parser
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
const PORT = 8080; // default port 8080

//fake url database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "111111",
    clickCount: 0
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "111111",
    clickCount: 0
  },
  i3BoKB: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "111111",
    clickCount: 0
  },
};
//fake user database

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
    hasClicked: false,
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
    hasClicked: false,
  },
  //for easy test
  "111111": {
    id: "111111",
    email: "admin@example.com",
    password: bcrypt.hashSync("test", 10),
    hasClicked: false,
  }
}

/* GET REQUESTS*/
//just demo useless
app.get("/hello", (req, res) => {
  const templateVars = {greeting: 'Hello World!'};
  res.render("hello_world", templateVars);
});
// Redirects to the urls page if no address is defined
app.get("/", (req, res) => {
  const id = req.session['user_id']
  if (id) {
    res.redirect('/urls')
  } else {
    res.redirect('/login')
  }
});


//register
app.get("/register", (req, res) => {
  const id = req.session['user_id']
  const user = getUser(id, users)
  if (user) {
    res.redirect('/urls')
  } else {
    const templateVars = {
      user
    }
    res.render('register', templateVars);
  }

});

//login
app.get('/login', (req, res) => {
  const templateVars = {
    message: 'Please Sign In First',
    user: null
  };
  res.render('login', templateVars);
});


// main page show all the urls
app.get("/urls", (req, res) => {
  const id = req.session['user_id']
  if (!id) {
    const templateVars = {
      message: 'Please Sign In First',
      user: null
    };
    res.render('login', templateVars);
  } else {
    const user = getUser(id, users)
    const urls = urlsForUser(id, urlDatabase)
    const templateVars = {urls, user,}
    res.render("urls_index", templateVars);
  }
});

// Create New URLs(long)
app.get("/urls/new", (req, res) => {
  const id = req.session['user_id']
  const user = getUser(id, users)
  if (id) {
    const templateVars = {user}
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }

});

//view short URLs
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session['user_id']
  if (!id) {
    res.redirect('/login')
  }
  const user = getUser(id, users)
  const {shortURL} = req.params
  if (!urlDatabase[shortURL]) {
    res.send('The URL you requested was not found.')
  }
  const clickCount = urlDatabase[shortURL]["clickCount"]
  const templateVars = {
    shortURL,
    'longURL': urlDatabase[shortURL] !== undefined ? urlDatabase[shortURL].longURL : undefined,
    user,
    clickCount,
    visitorCount
  };
  res.render("urls_show", templateVars);
});


// Redirect to longURL //
app.get("/u/:shortURL", (req, res) => {
  const {shortURL} = req.params;
  if (urlDatabase[shortURL] === undefined) {
    res.send("This URL you requested can not be found.")
  } else {
    // Statistics board logic
    visitorCount = getUniqueVisitorCount(req, users, visitorCount);
    urlDatabase[shortURL]["clickCount"] = clicks += 1;
    res.redirect(`${urlDatabase[shortURL].longURL}`);
  }
});


/* POST REQUESTS*/

// deal register
app.post("/register", (req, res) => {
  let {email, password} = req.body
  // no possible since I already do frontend check but assignment requires to add
  if (email === '' || password === '' || email === undefined || password === undefined) {
    res.send(400)
  } else {
    if (getUser(email, users)) {
      res.send("This email already beed used!");
    } else {
      req.session['user_id'] = registerUser(email, password, users).id;
      res.redirect(301, '/urls');
    }
  }
})

//deal login
app.post("/login", (req, res) => {
  // console.log('login Handler========', req.body)
  let {email, password} = req.body
  password = bcrypt.hashSync(password, 10)
  const user = getUser(email, users)
  // no possible since I already do frontend check but assignment requires to add
  if (email === '' || password === '' || email === undefined || password === undefined) {
    res.send(400)
  }
  if (!user) {
    res.send('Email or Password is not correct!!!')
  } else {
    req.session['user_id'] = user.id
    res.redirect('/urls')
  }

})

//deal logout
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect('/urls')
})

// deal form request
app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const id = req.session['user_id']
  const shortURL = generateRandomString(urlDatabase)
  const {longURL} = req.body
  urlDatabase[shortURL] = {longURL, userID: id, clickCount: 0}
  res.redirect('/urls/' + shortURL);
})


//update url resource method-override version
app.put("/urls/:shortURL", (req, res) => {
  // console.log(req.body)
  const {shortURL} = req.params;
  const id = req.session['user_id']
  if (!id) {
    res.redirect('/login');
  } else {
    const {newURL} = req.body;
    urlDatabase[shortURL] = {longURL: newURL, userID: id}
    res.redirect(`/urls`);
  }
})

//delete url resource method-override version
app.delete("/urls/:shortURL", (req, res) => {
  const {shortURL} = req.params;
  const id = req.session['user_id']
  if (id) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    //this is make more sense
    res.redirect('/login')
  }

})


app.listen(PORT, () => {
  console.log(`Dylan's URL TinyApp listening on port ${PORT}!`);
});
