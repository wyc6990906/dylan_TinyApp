const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//ejs
app.set("view engine", "ejs");

//just demo useless
app.get("/hello", (req, res) => {
  const templateVars = {greeting: 'Hello World!'};
  res.render("hello_world", templateVars);
});
app.get("/urls", (req, res) => {
  res.json(urlDatabase);
});


app.get("/", (req, res) => {
  const templateVars = {urls: urlDatabase}
  res.render("urls_index", templateVars);
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
