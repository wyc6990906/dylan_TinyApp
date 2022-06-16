const express = require("express")
const morgan = require('morgan')
// const cookieParser = require("cookie-parser")
const cookieSession = require('cookie-session');
// in order to make post buffer readable
const bodyParser = require('body-parser')
//hash password
const bcrypt = require('bcryptjs');
const app = express();
const {getUser, generateRandomString, urlsForUser} = require('./helper/helper')
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
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};
//fake user database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
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
  // res.redirect('/urls')
  const id = req.session['user_id']
  if (id) {
    res.redirect('/urls')
  } else {
    res.redirect('/login')
  }
});


//register
app.get("/register", (req, res) => {
  const templateVars = {
    message: null,
    user: null
  };
  res.render('register', templateVars);
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
    res.send('This url is not exist!!!')
  }
  const templateVars = {
    shortURL,
    'longURL': urlDatabase[shortURL] !== undefined ? urlDatabase[shortURL].longURL : undefined,
    user,
  };
  res.render("urls_show", templateVars);
});


// Redirect to longURL //
app.get("/u/:shortURL", (req, res) => {
  const {shortURL} = req.params;
  if (urlDatabase[shortURL] === undefined) {
    res.send("URL is not correct!!!")
  } else {
    res.redirect(`${urlDatabase[shortURL].longURL}`);
  }
});


/* POST REQUESTS*/

// deal register
app.post("/register", (req, res) => {
  // console.log('register Handler========', req.body)
  const id = generateRandomString(users)
  let {email, password} = req.body
  password = bcrypt.hashSync(password, 10)
  //email used already check
  for (const key in users) {
    if (users[key].email === email) {
      res.send('This email already beed used!')
      return
    }
  }
  // no possible since I already do frontend check but assignment requires to add
  if (email === '' || password === '' || email === undefined || password === undefined) {
    res.send(400)
  }
  const user = {id, email, password}
  users[id] = user
  // console.log(users)
  req.session['user_id'] = id
  res.redirect('/urls')
})

//deal login logic wrong
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
  res.redirect('/login')
})

// deal form request
app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const id = req.session['user_id']
  if (id) {
    const shortURL = generateRandomString(urlDatabase)
    const {longURL} = req.body
    urlDatabase[shortURL] = {longURL, userID: id}
    res.redirect('/urls/' + shortURL);
  } else {
    res.redirect('/login')
  }
})


//update url resource
app.post("/urls/:shortURL", (req, res) => {
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

//delete url resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const {shortURL} = req.params;
  const id = req.session['user_id']
  if (id) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/login')
  }

})


app.listen(PORT, () => {
  console.log(`Dylan's URL TinyApp listening on port ${PORT}!`);
});
