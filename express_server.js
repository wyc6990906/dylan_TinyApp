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
// getUser
const getUser = function (value, userDB) {
  return Object.values(userDB).find(user => user.id === value || user.email === value);
};
//get urlsForUser
const urlsForUser = function (id, urlDatabase) {
  let urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};


/* GET REQUESTS*/
//just demo useless
app.get("/hello", (req, res) => {
  const templateVars = {greeting: 'Hello World!'};
  res.render("hello_world", templateVars);
});
// Redirects to the urls page if no address is defined
app.get("/", (req, res) => {
  // res.redirect('/urls')
  const id = req.cookies['user_id']
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
  const id = req.cookies['user_id']
  if (!id) {
    const templateVars = {
      message: 'Please Sign In First',
      user: null
    };
    res.render('login',templateVars);
  } else {
    const user = getUser(id, users)
    const urls = urlsForUser(id, urlDatabase)
    const templateVars = {urls, user,}
    res.render("urls_index", templateVars);
  }
});

// Create New URLs(long)
app.get("/urls/new", (req, res) => {
  const id = req.cookies['user_id']
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
  const id = req.cookies['user_id']
  const user = getUser(id, users)
  const {shortURL} = req.params
  const templateVars = {
    shortURL,
    'longURL': urlDatabase[shortURL].longURL,
    user
  };
  res.render("urls_show", templateVars);
});


// Redirect to longURL //
app.get("/u/:shortURL", (req, res) => {
  const {shortURL} = req.params;
  const longURL = urlDatabase[shortURL];
  if (urlDatabase[shortURL] === undefined) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect(`${urlDatabase[shortURL].longURL}`);
  }
});


/* POST REQUESTS*/

// deal register
app.post("/register", (req, res) => {
  // console.log('register Handler========', req.body)
  const id = generateRandomString(users)
  const {email, password} = req.body
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
  res.cookie('user_id', id)
  res.redirect('/urls')
})

//deal login logic wrong
app.post("/login", (req, res) => {
  // console.log('login Handler========', req.body)
  const {email, password} = req.body
  const user = getUser(email, users)
  // no possible since I already do frontend check but assignment requires to add
  if (email === '' || password === '' || email === undefined || password === undefined) {
    res.send(400)
  }
  if (!user) {
    res.send('Email or Password is not correct!!!')
  } else {
    res.cookie('user_id', user.id)
    res.redirect('/urls')
  }

})

//deal logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/login')
})

// deal form request
app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const id = req.cookies["user_id"]
  if (id) {
    const shortURL = generateRandomString(urlDatabase)
    const {longURL} = req.body
    urlDatabase[shortURL] = {longURL, userID: id}
    res.redirect(`/urls`)
  } else {
    res.redirect('/login')
  }
})


//update url resource
app.post("/urls/:shortURL", (req, res) => {
  // console.log(req.body)
  const {shortURL} = req.params;
  const id = req.cookies["user_id"]
  if (!id) {
    res.redirect('/login');
  } else {
    const {newURL} = req.body;
    urlDatabase[shortURL] = {longURL:newURL,userID:id}
    res.redirect(`/urls`);
  }
})

//delete url resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const {shortURL} = req.params;
  const id = req.cookies["user_id"]
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
